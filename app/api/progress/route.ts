import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // Run all queries in parallel
  const [weights, sessions, foodAvg, prs, streakData] = await Promise.all([
    // Last 12 weeks of weight
    sql`
      SELECT logged_at, weight_kg
      FROM weight_logs
      WHERE user_id = ${auth.userId}
      ORDER BY logged_at DESC
      LIMIT 84
    `,

    // Sessions per week (last 8 weeks)
    sql`
      SELECT
        DATE_TRUNC('week', session_date)::DATE AS week,
        COUNT(*) FILTER (WHERE completed) AS completed,
        COUNT(*) AS total,
        AVG(duration_min) AS avg_duration
      FROM workout_sessions
      WHERE user_id = ${auth.userId}
        AND session_date >= CURRENT_DATE - INTERVAL '56 days'
      GROUP BY DATE_TRUNC('week', session_date)
      ORDER BY week DESC
    `,

    // Avg daily kcal and protein (last 4 weeks)
    sql`
      SELECT
        logged_at,
        SUM(kcal) AS kcal,
        SUM(protein_g) AS protein_g
      FROM food_logs
      WHERE user_id = ${auth.userId}
        AND logged_at >= CURRENT_DATE - INTERVAL '28 days'
      GROUP BY logged_at
      ORDER BY logged_at DESC
    `,

    // Personal records (top 10 exercises by volume)
    sql`
      SELECT DISTINCT ON (exercise_name)
        exercise_name,
        weight_kg AS best_weight,
        reps,
        created_at
      FROM exercise_sets
      WHERE user_id = ${auth.userId} AND is_pr = TRUE
      ORDER BY exercise_name, weight_kg DESC NULLS LAST
      LIMIT 10
    `,

    // Current streak (consecutive days with completed sessions)
    sql`
      WITH daily AS (
        SELECT DISTINCT session_date
        FROM workout_sessions
        WHERE user_id = ${auth.userId} AND completed = TRUE
        ORDER BY session_date DESC
      ),
      numbered AS (
        SELECT session_date,
               ROW_NUMBER() OVER (ORDER BY session_date DESC) AS rn
        FROM daily
      ),
      streak AS (
        SELECT session_date,
               session_date + rn::INT * INTERVAL '1 day' AS grp
        FROM numbered
      )
      SELECT COUNT(*) AS current_streak
      FROM streak
      WHERE grp = (SELECT grp FROM streak ORDER BY session_date DESC LIMIT 1)
    `,
  ]);

  // Summary stats
  const weightArr = weights.map(w => Number(w.weight_kg));
  const weightStats = weightArr.length > 0 ? {
    current: weightArr[0],
    start: weightArr[weightArr.length - 1],
    change: +(weightArr[0] - weightArr[weightArr.length - 1]).toFixed(2),
    lowest: Math.min(...weightArr),
    highest: Math.max(...weightArr),
  } : null;

  const kcalArr = foodAvg.map(f => Number(f.kcal));
  const protArr = foodAvg.map(f => Number(f.protein_g));
  const nutritionStats = kcalArr.length > 0 ? {
    avg_kcal: Math.round(kcalArr.reduce((a, b) => a + b, 0) / kcalArr.length),
    avg_protein: Math.round(protArr.reduce((a, b) => a + b, 0) / protArr.length),
    days_tracked: kcalArr.length,
  } : null;

  const totalCompleted = sessions.reduce((a, s) => a + Number(s.completed), 0);
  const totalStarted = sessions.reduce((a, s) => a + Number(s.total), 0);

  return NextResponse.json({
    weights,
    sessions,
    foodAvg,
    prs,
    streak: Number(streakData[0]?.current_streak ?? 0),
    weightStats,
    nutritionStats,
    trainingStats: {
      total_completed: totalCompleted,
      total_started: totalStarted,
      completion_rate: totalStarted > 0
        ? Math.round((totalCompleted / totalStarted) * 100)
        : 0,
    },
  });
}
