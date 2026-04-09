-- ============================================================
-- StudySync: Seed Data — Subjects and Tasks
-- ============================================================
-- Run order: 003 (after 001_initial_schema.sql)
-- Uses fixed UUIDs for idempotent re-runs.
-- ============================================================

-- ============================================================
-- SUBJECTS
-- ============================================================
INSERT INTO subjects (id, name, category, description) VALUES

  -- Mathematics
  ('a0000001-0000-0000-0000-000000000001', 'Algebra',              'Mathematics', 'Study of symbols and the rules for manipulating those symbols in equations and formulas.'),
  ('a0000001-0000-0000-0000-000000000002', 'Calculus',             'Mathematics', 'Branch of mathematics focused on limits, derivatives, integrals, and infinite series.'),
  ('a0000001-0000-0000-0000-000000000003', 'Statistics',           'Mathematics', 'Study of data collection, analysis, interpretation, and presentation.'),
  ('a0000001-0000-0000-0000-000000000004', 'Linear Algebra',       'Mathematics', 'Study of vectors, vector spaces, linear transformations, and systems of linear equations.'),
  ('a0000001-0000-0000-0000-000000000005', 'Discrete Mathematics', 'Mathematics', 'Study of mathematical structures that are fundamentally discrete rather than continuous.'),

  -- Science
  ('a0000002-0000-0000-0000-000000000001', 'Biology',              'Science', 'Study of living organisms, their structure, function, growth, evolution, and distribution.'),
  ('a0000002-0000-0000-0000-000000000002', 'Chemistry',            'Science', 'Study of matter, its properties, and the changes it undergoes.'),
  ('a0000002-0000-0000-0000-000000000003', 'Physics',              'Science', 'Study of matter, energy, and the interaction between them.'),
  ('a0000002-0000-0000-0000-000000000004', 'Earth Science',        'Science', 'Study of the Earth and its neighbors in space including geology, oceanography, and meteorology.'),
  ('a0000002-0000-0000-0000-000000000005', 'Environmental Science','Science', 'Interdisciplinary study of the environment and solutions to environmental problems.'),

  -- Humanities
  ('a0000003-0000-0000-0000-000000000001', 'History',     'Humanities', 'Study of past events, particularly in human affairs.'),
  ('a0000003-0000-0000-0000-000000000002', 'Philosophy',  'Humanities', 'Study of fundamental questions about existence, knowledge, values, reason, and language.'),
  ('a0000003-0000-0000-0000-000000000003', 'Literature',  'Humanities', 'Study of written works, including poetry, prose, fiction, and non-fiction.'),
  ('a0000003-0000-0000-0000-000000000004', 'Linguistics', 'Humanities', 'Scientific study of language and its structure, including morphology, syntax, and phonetics.'),

  -- Social Sciences
  ('a0000004-0000-0000-0000-000000000001', 'Economics',         'Social Sciences', 'Study of how individuals, businesses, and governments allocate resources.'),
  ('a0000004-0000-0000-0000-000000000002', 'Psychology',        'Social Sciences', 'Scientific study of the mind and behavior.'),
  ('a0000004-0000-0000-0000-000000000003', 'Sociology',         'Social Sciences', 'Study of human society, social relationships, and social institutions.'),
  ('a0000004-0000-0000-0000-000000000004', 'Political Science', 'Social Sciences', 'Study of political systems, governmental institutions, and political behavior.'),

  -- Computer Science
  ('a0000005-0000-0000-0000-000000000001', 'Programming Fundamentals', 'Computer Science', 'Core programming concepts including variables, control flow, functions, and OOP.'),
  ('a0000005-0000-0000-0000-000000000002', 'Data Structures',          'Computer Science', 'Study of data organization methods including arrays, linked lists, trees, and graphs.'),
  ('a0000005-0000-0000-0000-000000000003', 'Algorithms',               'Computer Science', 'Study of step-by-step computational procedures for solving problems efficiently.'),
  ('a0000005-0000-0000-0000-000000000004', 'Web Development',          'Computer Science', 'Building and maintaining websites and web applications using modern technologies.'),
  ('a0000005-0000-0000-0000-000000000005', 'Database Systems',         'Computer Science', 'Study of database design, query languages, and data management systems.'),

  -- Business
  ('a0000006-0000-0000-0000-000000000001', 'Accounting',  'Business', 'Recording, summarizing, and reporting financial transactions of a business.'),
  ('a0000006-0000-0000-0000-000000000002', 'Marketing',   'Business', 'Study of promoting and selling products or services, including market research.'),
  ('a0000006-0000-0000-0000-000000000003', 'Finance',     'Business', 'Study of money management, investments, and financial instruments.'),
  ('a0000006-0000-0000-0000-000000000004', 'Management',  'Business', 'Study of planning, organizing, leading, and controlling organizational resources.'),

  -- Arts
  ('a0000007-0000-0000-0000-000000000001', 'Art History',     'Arts', 'Study of visual art and architecture through history and across cultures.'),
  ('a0000007-0000-0000-0000-000000000002', 'Music Theory',    'Arts', 'Study of the practices and possibilities of music including notation and composition.'),
  ('a0000007-0000-0000-0000-000000000003', 'Creative Writing','Arts', 'Craft of writing fiction, poetry, and non-fiction narratives with artistic intent.'),

  -- Languages
  ('a0000008-0000-0000-0000-000000000001', 'Spanish',  'Languages', 'Study of the Spanish language including grammar, vocabulary, and conversation.'),
  ('a0000008-0000-0000-0000-000000000002', 'French',   'Languages', 'Study of the French language including grammar, vocabulary, and conversation.'),
  ('a0000008-0000-0000-0000-000000000003', 'Mandarin', 'Languages', 'Study of Standard Chinese including characters, tones, grammar, and conversation.'),
  ('a0000008-0000-0000-0000-000000000004', 'German',   'Languages', 'Study of the German language including grammar, vocabulary, and conversation.')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TASKS
-- ============================================================

-- ---- ALGEBRA ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000001-0001-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001',
   'Solve linear equations',
   'Practice solving one-variable and two-variable linear equations using algebraic manipulation.',
   'easy'),
  ('b0000001-0001-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001',
   'Factor polynomials',
   'Apply factoring techniques including GCF, difference of squares, and trinomial factoring.',
   'medium'),
  ('b0000001-0001-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001',
   'Solve systems of equations',
   'Use substitution and elimination methods to solve systems of two or more linear equations.',
   'medium'),
  ('b0000001-0001-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001',
   'Work with quadratic functions',
   'Graph quadratic functions, find vertex and intercepts, and solve quadratic equations using various methods.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- CALCULUS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000001-0002-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002',
   'Practice limits and continuity',
   'Evaluate limits algebraically and graphically; determine continuity of functions at a point.',
   'easy'),
  ('b0000001-0002-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002',
   'Differentiate functions',
   'Apply basic differentiation rules including power, product, quotient, and chain rules.',
   'medium'),
  ('b0000001-0002-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000002',
   'Apply chain rule',
   'Practice differentiating composite functions using the chain rule in various contexts.',
   'medium'),
  ('b0000001-0002-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000002',
   'Solve integration problems',
   'Evaluate definite and indefinite integrals using substitution and integration by parts.',
   'hard'),
  ('b0000001-0002-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000002',
   'Apply fundamental theorem of calculus',
   'Connect differentiation and integration using the fundamental theorem; evaluate definite integrals.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- STATISTICS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000001-0003-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003',
   'Calculate descriptive statistics',
   'Compute mean, median, mode, variance, and standard deviation for data sets.',
   'easy'),
  ('b0000001-0003-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000003',
   'Create probability distributions',
   'Build and interpret probability distributions including binomial and normal distributions.',
   'medium'),
  ('b0000001-0003-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003',
   'Conduct hypothesis testing',
   'Perform t-tests, chi-square tests, and ANOVA; interpret p-values and confidence intervals.',
   'hard'),
  ('b0000001-0003-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000003',
   'Perform regression analysis',
   'Calculate and interpret simple and multiple linear regression models; assess model fit.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- LINEAR ALGEBRA ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000001-0004-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004',
   'Perform matrix operations',
   'Add, subtract, multiply matrices and compute transposes and inverses.',
   'easy'),
  ('b0000001-0004-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000004',
   'Solve linear systems with matrices',
   'Use row reduction and Gaussian elimination to solve systems of linear equations.',
   'medium'),
  ('b0000001-0004-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000004',
   'Find eigenvalues and eigenvectors',
   'Calculate eigenvalues and eigenvectors for square matrices; understand diagonalization.',
   'hard'),
  ('b0000001-0004-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004',
   'Study vector spaces',
   'Explore subspaces, basis, dimension, and linear independence of vector sets.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- DISCRETE MATHEMATICS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000001-0005-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000005',
   'Practice logic and proof techniques',
   'Write direct proofs, proofs by contradiction, and proofs by induction.',
   'easy'),
  ('b0000001-0005-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000005',
   'Study sets and functions',
   'Work with set operations, relations, and function properties including bijections.',
   'medium'),
  ('b0000001-0005-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000005',
   'Analyze graph theory problems',
   'Explore graph properties, traversals, connectivity, and basic graph algorithms.',
   'hard'),
  ('b0000001-0005-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000005',
   'Apply combinatorics',
   'Solve counting problems using permutations, combinations, and the pigeonhole principle.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- BIOLOGY ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000002-0001-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000001',
   'Review cell structure',
   'Study organelles, cell membrane structure, and the differences between prokaryotic and eukaryotic cells.',
   'easy'),
  ('b0000002-0001-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000001',
   'Study genetics and heredity',
   'Understand Mendelian inheritance, Punnett squares, and basic genetic crosses.',
   'medium'),
  ('b0000002-0001-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000001',
   'Analyze ecosystems',
   'Examine food webs, energy flow, nutrient cycles, and ecological relationships.',
   'medium'),
  ('b0000002-0001-0000-0000-000000000004', 'a0000002-0000-0000-0000-000000000001',
   'Understand molecular biology',
   'Study DNA replication, transcription, translation, and gene expression mechanisms.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- CHEMISTRY ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000002-0002-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002',
   'Balance chemical equations',
   'Apply conservation of mass to balance chemical equations using coefficient adjustment.',
   'easy'),
  ('b0000002-0002-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002',
   'Study periodic table trends',
   'Analyze trends in electronegativity, atomic radius, ionization energy, and electron affinity.',
   'easy'),
  ('b0000002-0002-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000002',
   'Solve stoichiometry problems',
   'Calculate moles, masses, and volumes in chemical reactions using molar ratios.',
   'medium'),
  ('b0000002-0002-0000-0000-000000000004', 'a0000002-0000-0000-0000-000000000002',
   'Understand thermodynamics',
   'Study enthalpy, entropy, Gibbs free energy, and spontaneity of chemical reactions.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- PHYSICS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000002-0003-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000003',
   'Solve kinematics problems',
   'Apply equations of motion to analyze position, velocity, acceleration, and time.',
   'easy'),
  ('b0000002-0003-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000003',
   'Apply Newton''s laws',
   'Analyze forces, draw free-body diagrams, and apply Newton''s three laws of motion.',
   'medium'),
  ('b0000002-0003-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000003',
   'Study electromagnetic fields',
   'Explore electric and magnetic fields, Coulomb''s law, and electromagnetic induction.',
   'hard'),
  ('b0000002-0003-0000-0000-000000000004', 'a0000002-0000-0000-0000-000000000003',
   'Understand quantum mechanics basics',
   'Introduction to wave-particle duality, Heisenberg uncertainty, and quantum states.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- EARTH SCIENCE ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000002-0004-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000004',
   'Study plate tectonics',
   'Understand the movement of lithospheric plates, earthquakes, and volcanic activity.',
   'easy'),
  ('b0000002-0004-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000004',
   'Analyze weather patterns',
   'Study atmospheric pressure, fronts, precipitation, and meteorological systems.',
   'medium'),
  ('b0000002-0004-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000004',
   'Explore rock and mineral identification',
   'Classify rocks and minerals by their properties, formation processes, and rock cycle.',
   'medium'),
  ('b0000002-0004-0000-0000-000000000004', 'a0000002-0000-0000-0000-000000000004',
   'Study oceanography',
   'Examine ocean circulation, tides, marine ecosystems, and ocean-atmosphere interactions.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- ENVIRONMENTAL SCIENCE ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000002-0005-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000005',
   'Study biodiversity',
   'Examine species diversity, ecosystem diversity, and conservation strategies.',
   'easy'),
  ('b0000002-0005-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000005',
   'Analyze pollution and remediation',
   'Study types of pollution (air, water, soil), their sources, and remediation techniques.',
   'medium'),
  ('b0000002-0005-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000005',
   'Understand climate change',
   'Examine causes, evidence, and impacts of climate change and mitigation strategies.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- HISTORY ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000003-0001-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000001',
   'Read primary source documents',
   'Analyze speeches, letters, and records from historical periods to understand context.',
   'easy'),
  ('b0000003-0001-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000001',
   'Write historical analysis',
   'Construct evidence-based arguments about historical causation, change, and continuity.',
   'medium'),
  ('b0000003-0001-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000001',
   'Compare historical periods',
   'Identify similarities and differences across historical eras and civilizations.',
   'medium'),
  ('b0000003-0001-0000-0000-000000000004', 'a0000003-0000-0000-0000-000000000001',
   'Research and cite sources',
   'Locate reliable secondary sources, evaluate credibility, and apply citation formats.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- PHILOSOPHY ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000003-0002-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000002',
   'Analyze philosophical arguments',
   'Identify premises, conclusions, and logical validity in philosophical texts.',
   'easy'),
  ('b0000003-0002-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000002',
   'Study major philosophical schools',
   'Survey key ideas from Empiricism, Rationalism, Existentialism, and Utilitarianism.',
   'medium'),
  ('b0000003-0002-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000002',
   'Write a philosophical essay',
   'Construct a clear, well-argued philosophical position supported by evidence and reasoning.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- LITERATURE ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000003-0003-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003',
   'Identify literary devices',
   'Recognize and interpret metaphor, simile, allusion, irony, and other literary techniques.',
   'easy'),
  ('b0000003-0003-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000003',
   'Analyze character development',
   'Trace how characters evolve through plot events and conflicts in a literary work.',
   'medium'),
  ('b0000003-0003-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003',
   'Write a literary analysis essay',
   'Construct a thesis-driven essay analyzing theme, structure, or style in a literary text.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- LINGUISTICS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000003-0004-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000004',
   'Study phonetics and phonology',
   'Learn the International Phonetic Alphabet and analyze sound patterns in language.',
   'easy'),
  ('b0000003-0004-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000004',
   'Analyze morphology and syntax',
   'Examine word structure and sentence formation rules in natural languages.',
   'medium'),
  ('b0000003-0004-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000004',
   'Study language acquisition theories',
   'Compare theories of first and second language acquisition and their evidence base.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- ECONOMICS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000004-0001-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000001',
   'Analyze supply and demand',
   'Graph supply and demand curves; analyze shifts and calculate equilibrium price and quantity.',
   'easy'),
  ('b0000004-0001-0000-0000-000000000002', 'a0000004-0000-0000-0000-000000000001',
   'Study market structures',
   'Compare perfect competition, monopoly, oligopoly, and monopolistic competition.',
   'medium'),
  ('b0000004-0001-0000-0000-000000000003', 'a0000004-0000-0000-0000-000000000001',
   'Apply macroeconomic concepts',
   'Analyze GDP, inflation, unemployment, fiscal policy, and monetary policy tools.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- PSYCHOLOGY ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000004-0002-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000002',
   'Review research methods',
   'Study experimental design, survey methods, observational research, and ethical guidelines.',
   'easy'),
  ('b0000004-0002-0000-0000-000000000002', 'a0000004-0000-0000-0000-000000000002',
   'Study cognitive processes',
   'Explore memory, attention, perception, language, and problem-solving mechanisms.',
   'medium'),
  ('b0000004-0002-0000-0000-000000000003', 'a0000004-0000-0000-0000-000000000002',
   'Analyze psychological theories',
   'Evaluate major theories including psychoanalytic, behavioral, humanistic, and cognitive.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- SOCIOLOGY ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000004-0003-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000003',
   'Study sociological perspectives',
   'Review functionalism, conflict theory, symbolic interactionism, and feminist theory.',
   'easy'),
  ('b0000004-0003-0000-0000-000000000002', 'a0000004-0000-0000-0000-000000000003',
   'Analyze social stratification',
   'Examine class, race, gender inequality and their effects on life outcomes.',
   'medium'),
  ('b0000004-0003-0000-0000-000000000003', 'a0000004-0000-0000-0000-000000000003',
   'Research social institutions',
   'Investigate family, education, religion, economy, and government as social systems.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- POLITICAL SCIENCE ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000004-0004-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000004',
   'Study government structures',
   'Compare presidential, parliamentary, and federal systems of government.',
   'easy'),
  ('b0000004-0004-0000-0000-000000000002', 'a0000004-0000-0000-0000-000000000004',
   'Analyze political ideologies',
   'Examine liberalism, conservatism, socialism, and other major political ideologies.',
   'medium'),
  ('b0000004-0004-0000-0000-000000000003', 'a0000004-0000-0000-0000-000000000004',
   'Study international relations',
   'Explore theories of international relations, diplomacy, and global governance.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- PROGRAMMING FUNDAMENTALS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000005-0001-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000001',
   'Practice variables and data types',
   'Work with integers, floats, strings, booleans, and type conversion in code.',
   'easy'),
  ('b0000005-0001-0000-0000-000000000002', 'a0000005-0000-0000-0000-000000000001',
   'Write control flow statements',
   'Practice if/else conditionals, for loops, while loops, and switch statements.',
   'easy'),
  ('b0000005-0001-0000-0000-000000000003', 'a0000005-0000-0000-0000-000000000001',
   'Build functions and methods',
   'Define and call functions with parameters and return values; understand scope.',
   'medium'),
  ('b0000005-0001-0000-0000-000000000004', 'a0000005-0000-0000-0000-000000000001',
   'Debug code',
   'Use debugging tools and techniques to identify and fix errors in programs.',
   'medium'),
  ('b0000005-0001-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000001',
   'Implement OOP concepts',
   'Create classes, objects, and apply inheritance, encapsulation, and polymorphism.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- DATA STRUCTURES ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000005-0002-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002',
   'Implement arrays and lists',
   'Work with static arrays and dynamic lists; practice common operations and traversals.',
   'easy'),
  ('b0000005-0002-0000-0000-000000000002', 'a0000005-0000-0000-0000-000000000002',
   'Build linked lists',
   'Implement singly and doubly linked lists; practice insertion, deletion, and search.',
   'medium'),
  ('b0000005-0002-0000-0000-000000000003', 'a0000005-0000-0000-0000-000000000002',
   'Implement trees and graphs',
   'Build binary trees, BSTs, and graph adjacency structures; implement traversals.',
   'hard'),
  ('b0000005-0002-0000-0000-000000000004', 'a0000005-0000-0000-0000-000000000002',
   'Analyze time complexity',
   'Calculate Big-O complexity for searching, sorting, and data structure operations.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- ALGORITHMS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000005-0003-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000003',
   'Practice sorting algorithms',
   'Implement and compare bubble sort, merge sort, quicksort, and heap sort.',
   'easy'),
  ('b0000005-0003-0000-0000-000000000002', 'a0000005-0000-0000-0000-000000000003',
   'Study searching algorithms',
   'Implement linear search and binary search; analyze their time and space complexities.',
   'medium'),
  ('b0000005-0003-0000-0000-000000000003', 'a0000005-0000-0000-0000-000000000003',
   'Apply dynamic programming',
   'Solve optimization problems using memoization and tabulation techniques.',
   'hard'),
  ('b0000005-0003-0000-0000-000000000004', 'a0000005-0000-0000-0000-000000000003',
   'Study graph algorithms',
   'Implement BFS, DFS, Dijkstra, and A* algorithms for graph traversal and shortest path.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- WEB DEVELOPMENT ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000005-0004-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000004',
   'Build HTML and CSS layouts',
   'Create semantic HTML structure and style with CSS using flexbox and grid layouts.',
   'easy'),
  ('b0000005-0004-0000-0000-000000000002', 'a0000005-0000-0000-0000-000000000004',
   'Write JavaScript fundamentals',
   'Practice DOM manipulation, event handling, and asynchronous JavaScript with promises.',
   'medium'),
  ('b0000005-0004-0000-0000-000000000003', 'a0000005-0000-0000-0000-000000000004',
   'Build a React component',
   'Create functional React components with props, state, and hooks.',
   'medium'),
  ('b0000005-0004-0000-0000-000000000004', 'a0000005-0000-0000-0000-000000000004',
   'Implement REST API integration',
   'Fetch data from APIs, handle errors, and display dynamic content in a web application.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- DATABASE SYSTEMS ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000005-0005-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000005',
   'Write SQL queries',
   'Practice SELECT, INSERT, UPDATE, DELETE statements and filtering with WHERE clauses.',
   'easy'),
  ('b0000005-0005-0000-0000-000000000002', 'a0000005-0000-0000-0000-000000000005',
   'Design a database schema',
   'Create entity-relationship diagrams and normalize schemas to 3NF.',
   'medium'),
  ('b0000005-0005-0000-0000-000000000003', 'a0000005-0000-0000-0000-000000000005',
   'Write complex SQL joins',
   'Practice INNER, LEFT, RIGHT, and FULL OUTER JOINs across multiple tables.',
   'medium'),
  ('b0000005-0005-0000-0000-000000000004', 'a0000005-0000-0000-0000-000000000005',
   'Study transactions and indexing',
   'Understand ACID properties, write transactions, and design indexes for performance.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- ACCOUNTING ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000006-0001-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000001',
   'Practice journal entries',
   'Record business transactions using double-entry bookkeeping in journal format.',
   'easy'),
  ('b0000006-0001-0000-0000-000000000002', 'a0000006-0000-0000-0000-000000000001',
   'Prepare financial statements',
   'Create income statements, balance sheets, and cash flow statements from trial balances.',
   'medium'),
  ('b0000006-0001-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000001',
   'Analyze financial ratios',
   'Calculate and interpret liquidity, profitability, and leverage ratios from financial data.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- MARKETING ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000006-0002-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000002',
   'Study marketing mix (4Ps)',
   'Analyze product, price, place, and promotion strategies for a given market.',
   'easy'),
  ('b0000006-0002-0000-0000-000000000002', 'a0000006-0000-0000-0000-000000000002',
   'Conduct market segmentation analysis',
   'Identify and profile target market segments using demographic and psychographic data.',
   'medium'),
  ('b0000006-0002-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000002',
   'Develop a marketing campaign plan',
   'Create a campaign brief with objectives, target audience, messaging, and KPIs.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- FINANCE ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000006-0003-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000003',
   'Calculate time value of money',
   'Apply present value and future value formulas to investment and loan scenarios.',
   'easy'),
  ('b0000006-0003-0000-0000-000000000002', 'a0000006-0000-0000-0000-000000000003',
   'Analyze investment portfolios',
   'Calculate risk, return, and diversification benefits of asset portfolios.',
   'medium'),
  ('b0000006-0003-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000003',
   'Study derivatives and options',
   'Understand call/put options, futures, and basic derivatives pricing concepts.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- MANAGEMENT ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000006-0004-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000004',
   'Study management functions',
   'Review planning, organizing, leading, and controlling as core management functions.',
   'easy'),
  ('b0000006-0004-0000-0000-000000000002', 'a0000006-0000-0000-0000-000000000004',
   'Analyze leadership styles',
   'Compare transformational, transactional, servant, and situational leadership models.',
   'medium'),
  ('b0000006-0004-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000004',
   'Apply strategic management concepts',
   'Conduct SWOT analysis and develop strategic recommendations for a business case.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- ART HISTORY ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000007-0001-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000001',
   'Study major art movements',
   'Survey Renaissance, Baroque, Impressionism, Modernism, and Contemporary art movements.',
   'easy'),
  ('b0000007-0001-0000-0000-000000000002', 'a0000007-0000-0000-0000-000000000001',
   'Analyze artwork formally',
   'Apply formal analysis to describe line, color, composition, and texture in artworks.',
   'medium'),
  ('b0000007-0001-0000-0000-000000000003', 'a0000007-0000-0000-0000-000000000001',
   'Write an art historical essay',
   'Contextualize an artwork within its historical, cultural, and stylistic context.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- MUSIC THEORY ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000007-0002-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000002',
   'Learn note reading and rhythm',
   'Practice reading treble and bass clef notation, note values, and time signatures.',
   'easy'),
  ('b0000007-0002-0000-0000-000000000002', 'a0000007-0000-0000-0000-000000000002',
   'Study scales and modes',
   'Learn major, minor, and modal scales; understand their intervals and applications.',
   'medium'),
  ('b0000007-0002-0000-0000-000000000003', 'a0000007-0000-0000-0000-000000000002',
   'Analyze harmonic progressions',
   'Identify and construct chord progressions; analyze harmony in musical excerpts.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- CREATIVE WRITING ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000007-0003-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000003',
   'Freewrite for 15 minutes',
   'Write continuously without stopping to build writing fluency and generate raw ideas.',
   'easy'),
  ('b0000007-0003-0000-0000-000000000002', 'a0000007-0000-0000-0000-000000000003',
   'Outline a short story',
   'Create a structured outline with beginning, middle, and end including key plot points.',
   'easy'),
  ('b0000007-0003-0000-0000-000000000003', 'a0000007-0000-0000-0000-000000000003',
   'Write character profiles',
   'Develop detailed character sheets exploring background, motivation, voice, and arc.',
   'medium'),
  ('b0000007-0003-0000-0000-000000000004', 'a0000007-0000-0000-0000-000000000003',
   'Edit and revise draft',
   'Apply revision techniques to improve clarity, pacing, dialogue, and narrative flow.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- SPANISH ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000008-0001-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000001',
   'Practice vocabulary flashcards',
   'Review and memorize thematic vocabulary sets using spaced repetition techniques.',
   'easy'),
  ('b0000008-0001-0000-0000-000000000002', 'a0000008-0000-0000-0000-000000000001',
   'Complete grammar exercises',
   'Practice verb conjugation, noun-adjective agreement, and sentence structure rules.',
   'medium'),
  ('b0000008-0001-0000-0000-000000000003', 'a0000008-0000-0000-0000-000000000001',
   'Write short paragraphs',
   'Compose structured paragraphs using target grammar and vocabulary in context.',
   'medium'),
  ('b0000008-0001-0000-0000-000000000004', 'a0000008-0000-0000-0000-000000000001',
   'Practice conversation prompts',
   'Respond to open-ended prompts aloud or in writing to simulate real-world conversation.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- FRENCH ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000008-0002-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000002',
   'Practice vocabulary flashcards',
   'Review and memorize French vocabulary sets across themes using spaced repetition.',
   'easy'),
  ('b0000008-0002-0000-0000-000000000002', 'a0000008-0000-0000-0000-000000000002',
   'Complete grammar exercises',
   'Practice French verb tenses, gender agreement, and pronoun usage.',
   'medium'),
  ('b0000008-0002-0000-0000-000000000003', 'a0000008-0000-0000-0000-000000000002',
   'Write short paragraphs',
   'Compose paragraphs in French using correct grammar and targeted vocabulary.',
   'medium'),
  ('b0000008-0002-0000-0000-000000000004', 'a0000008-0000-0000-0000-000000000002',
   'Practice conversation prompts',
   'Respond to French conversation prompts to develop speaking and writing fluency.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- MANDARIN ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000008-0003-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000003',
   'Practice Pinyin and tones',
   'Drill the four Mandarin tones using Pinyin romanization for correct pronunciation.',
   'easy'),
  ('b0000008-0003-0000-0000-000000000002', 'a0000008-0000-0000-0000-000000000003',
   'Learn character recognition',
   'Study and write common simplified Chinese characters using stroke order practice.',
   'medium'),
  ('b0000008-0003-0000-0000-000000000003', 'a0000008-0000-0000-0000-000000000003',
   'Practice sentence patterns',
   'Use core Mandarin sentence structures to form statements, questions, and negations.',
   'medium'),
  ('b0000008-0003-0000-0000-000000000004', 'a0000008-0000-0000-0000-000000000003',
   'Practice conversation prompts',
   'Engage with Mandarin conversation scenarios to build speaking and listening skills.',
   'hard')
ON CONFLICT (id) DO NOTHING;

-- ---- GERMAN ----
INSERT INTO tasks (id, subject_id, name, description, difficulty) VALUES
  ('b0000008-0004-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000004',
   'Practice vocabulary flashcards',
   'Memorize German vocabulary with attention to noun gender (der/die/das).',
   'easy'),
  ('b0000008-0004-0000-0000-000000000002', 'a0000008-0000-0000-0000-000000000004',
   'Complete grammar exercises',
   'Practice German case system (nominative, accusative, dative) and verb conjugation.',
   'medium'),
  ('b0000008-0004-0000-0000-000000000003', 'a0000008-0000-0000-0000-000000000004',
   'Write short paragraphs',
   'Compose short German texts applying correct grammar, word order, and vocabulary.',
   'medium'),
  ('b0000008-0004-0000-0000-000000000004', 'a0000008-0000-0000-0000-000000000004',
   'Practice conversation prompts',
   'Respond to German conversation prompts to develop speaking and writing fluency.',
   'hard')
ON CONFLICT (id) DO NOTHING;
