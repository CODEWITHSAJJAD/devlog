INSERT INTO lookups (id, category, code, label, sort_order, created_by, _updated_by, is_active) VALUES
-- ==========================================
-- PROJECT STATUSES
-- ==========================================
('PROJ_STAT_NOT_STARTED', 'PROJECT_STATUS', 'NOT_STARTED', 'Not Started', 10, 'SYSTEM', 'SYSTEM', 1),
('PROJ_STAT_ACTIVE',      'PROJECT_STATUS', 'ACTIVE',      'Active',      20, 'SYSTEM', 'SYSTEM', 1),
('PROJ_STAT_ON_HOLD',     'PROJECT_STATUS', 'ON_HOLD',     'On Hold',     30, 'SYSTEM', 'SYSTEM', 1),
('PROJ_STAT_COMPLETED',   'PROJECT_STATUS', 'COMPLETED',   'Completed',   40, 'SYSTEM', 'SYSTEM', 1),

-- ==========================================
-- TASK STATUSES (Kanban Columns)
-- ==========================================
('TASK_STAT_BACKLOG',     'TASK_STATUS',    'BACKLOG',     'Backlog',     10, 'SYSTEM', 'SYSTEM', 1),
('TASK_STAT_TODO',        'TASK_STATUS',    'TODO',        'To Do',       20, 'SYSTEM', 'SYSTEM', 1),
('TASK_STAT_IN_PROGRESS', 'TASK_STATUS',    'IN_PROGRESS', 'In Progress', 30, 'SYSTEM', 'SYSTEM', 1),
('TASK_STAT_BLOCKED',     'TASK_STATUS',    'BLOCKED',     'Blocked',     40, 'SYSTEM', 'SYSTEM', 1),
('TASK_STAT_DONE',        'TASK_STATUS',    'DONE',        'Done',        50, 'SYSTEM', 'SYSTEM', 1),

-- ==========================================
-- PRIORITIES
-- ==========================================
('PRIO_LOW',              'PRIORITY',       'LOW',         'Low',         10, 'SYSTEM', 'SYSTEM', 1),
('PRIO_MEDIUM',           'PRIORITY',       'MEDIUM',      'Medium',      20, 'SYSTEM', 'SYSTEM', 1),
('PRIO_HIGH',             'PRIORITY',       'HIGH',        'High',        30, 'SYSTEM', 'SYSTEM', 1),

-- ==========================================
-- TASK TYPES
-- ==========================================
('TASK_TYPE_FEATURE',     'TASK_TYPE',      'FEATURE',     'Feature',     10, 'SYSTEM', 'SYSTEM', 1),
('TASK_TYPE_BUG',         'TASK_TYPE',      'BUG',         'Bug',         20, 'SYSTEM', 'SYSTEM', 1),
('TASK_TYPE_RD',          'TASK_TYPE',      'RD',          'R&D',         30, 'SYSTEM', 'SYSTEM', 1);
