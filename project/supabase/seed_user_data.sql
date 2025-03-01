-- Insert or update user profile for ramo@gmail.com
DO $$
DECLARE
    user_id UUID := 'e47ac10b-58cc-4372-a567-0e02b2c3d479';
BEGIN
    -- Create or update user profile
    INSERT INTO user_profiles (
        id,
        full_name,
        avatar_url,
        email,
        role,
        department,
        location,
        bio
    ) VALUES (
        user_id,
        'Ramazan Çakıcı',
        'https://avatars.githubusercontent.com/u/12345678',
        'ramo@gmail.com',
        'Senior Developer',
        'Software Engineering',
        'Istanbul',
        'Passionate full-stack developer with expertise in React and Node.js'
    )
    ON CONFLICT (email)
    DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        location = EXCLUDED.location,
        bio = EXCLUDED.bio;

    -- Create or update user statistics
    INSERT INTO user_stats (
        user_id,
        xp,
        level,
        completed_trainings,
        monthly_completions,
        streak,
        longest_streak,
        badges,
        total_hours,
        courses_in_progress,
        certificates_earned,
        contributions
    ) VALUES (
        user_id::UUID,
        4750,  -- Realistic XP for an active user
        12,    -- Corresponding level for XP
        32,    -- Completed trainings
        8,     -- Monthly completions
        15,    -- Current streak
        25,    -- Longest streak achieved
        18,    -- Number of badges earned
        245,   -- Total hours spent learning
        4,     -- Current courses in progress
        12,    -- Certificates earned
        56     -- Contributions made
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        xp = EXCLUDED.xp,
        level = EXCLUDED.level,
        completed_trainings = EXCLUDED.completed_trainings,
        monthly_completions = EXCLUDED.monthly_completions,
        streak = EXCLUDED.streak,
        longest_streak = EXCLUDED.longest_streak,
        badges = EXCLUDED.badges,
        total_hours = EXCLUDED.total_hours,
        courses_in_progress = EXCLUDED.courses_in_progress,
        certificates_earned = EXCLUDED.certificates_earned,
        contributions = EXCLUDED.contributions;

    -- Delete existing certifications and insert new ones
    DELETE FROM user_certifications WHERE user_id = user_id;
    INSERT INTO user_certifications (user_id, certification_name, issue_date, expiry_date, score) VALUES
    (user_id, 'Advanced React Development', NOW() - INTERVAL '2 months', NOW() + INTERVAL '22 months', 92),
    (user_id, 'Node.js Performance Optimization', NOW() - INTERVAL '4 months', NOW() + INTERVAL '20 months', 88),
    (user_id, 'Cloud Architecture Fundamentals', NOW() - INTERVAL '6 months', NOW() + INTERVAL '18 months', 95);

    -- Delete existing achievements and insert new ones
    DELETE FROM user_achievements WHERE user_id = user_id;
    INSERT INTO user_achievements (user_id, achievement_name, earned_date, description) VALUES
    (user_id, 'Code Master', NOW() - INTERVAL '1 month', 'Completed 30 coding challenges'),
    (user_id, 'Team Player', NOW() - INTERVAL '2 months', 'Helped 20 other learners'),
    (user_id, 'Quick Learner', NOW() - INTERVAL '3 months', 'Completed 5 courses in one month');

    -- Update or insert learning path
    INSERT INTO learning_paths (user_id, path_name, progress, target_completion) VALUES
    (user_id, 'Full Stack Development', 75, NOW() + INTERVAL '3 months')
    ON CONFLICT (user_id)
    DO UPDATE SET
        path_name = EXCLUDED.path_name,
        progress = EXCLUDED.progress,
        target_completion = EXCLUDED.target_completion;

END $$;