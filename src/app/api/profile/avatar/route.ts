import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

function getExtFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return map[mimeType] || 'jpg'
}

// ============================================================
// POST /api/profile/avatar
// Upload a new avatar image
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('avatar')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No avatar file provided' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB' },
        { status: 400 }
      )
    }

    const ext = getExtFromMime(file.type)
    const fileName = `${userId}/${Date.now()}.${ext}`
    const fileBuffer = await file.arrayBuffer()

    const serviceClient = createServiceRoleClient()

    // Upload to Supabase Storage
    const { error: uploadError } = await serviceClient.storage
      .from('avatars')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const avatarUrl = urlData.publicUrl

    // Delete old avatar if it exists
    const { data: currentProfile } = await serviceClient
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single()

    if (currentProfile?.avatar_url) {
      try {
        // Extract the path from the URL
        const url = new URL(currentProfile.avatar_url)
        const pathParts = url.pathname.split('/avatars/')
        if (pathParts.length > 1) {
          const oldPath = pathParts[1]
          await serviceClient.storage.from('avatars').remove([oldPath])
        }
      } catch (err) {
        // Non-critical: log but continue
        console.warn('Failed to delete old avatar:', err)
      }
    }

    // Update profile with new avatar URL
    const { error: updateError } = await serviceClient
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Try to clean up the uploaded file
      await serviceClient.storage.from('avatars').remove([fileName])
      return NextResponse.json({ error: 'Failed to update profile with new avatar' }, { status: 500 })
    }

    return NextResponse.json({ avatar_url: avatarUrl })
  } catch (err) {
    console.error('POST /api/profile/avatar error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// DELETE /api/profile/avatar
// Remove the current avatar
// ============================================================
export async function DELETE() {
  try {
    const supabase = createServerComponentClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const serviceClient = createServiceRoleClient()

    // Get current avatar URL
    const { data: profile, error: fetchError } = await serviceClient
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Delete from storage if avatar exists
    if (profile.avatar_url) {
      try {
        const url = new URL(profile.avatar_url)
        const pathParts = url.pathname.split('/avatars/')
        if (pathParts.length > 1) {
          const filePath = pathParts[1]
          const { error: deleteError } = await serviceClient.storage
            .from('avatars')
            .remove([filePath])

          if (deleteError) {
            console.warn('Failed to delete avatar from storage:', deleteError)
          }
        }
      } catch (err) {
        console.warn('Error parsing avatar URL:', err)
      }
    }

    // Clear avatar_url in profile
    const { error: updateError } = await serviceClient
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error clearing avatar_url:', updateError)
      return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/profile/avatar error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
