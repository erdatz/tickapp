import { Score, Player, Game } from '../models/index.js';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';

export async function addScore(playerId, gameId, points, result) {
  const scoreRes = await Result.fromPromise(
    Score.findOne({ where: { playerId, gameId } }),
    (e) => new AppError('Error buscando score', 500, { cause: e })
  );

  if (scoreRes.isErr) return scoreRes;

  if (scoreRes.value) {
    scoreRes.value.score = points;
    scoreRes.value.result = result;
    await scoreRes.value.save();
    return Result.ok(scoreRes.value);
  }

  const newScore = await Result.fromPromise(
    Score.create({ playerId, gameId, score: points, result }),
    (e) => new AppError('Error creando score', 500, { cause: e })
  );

  return newScore;
}

export async function getScoresByGame(gameId) {
  const res = await Result.fromPromise(
    Score.findAll({
      where: { gameId },
      include: [
        {
          model: Player,
          as: 'player',
          required: false,
          attributes: ['id', 'nickname']
        }
      ],
      order: [['score', 'DESC']]
    }),
    (e) => new AppError('Error obteniendo puntajes de la partida', 500, { cause: e })
  );

  if (res.isErr) return res;

  const scores = res.value.map((s) => ({
    playerId: s.playerId,
    playerName: s.player?.nickname || 'Desconocido',
    score: s.score,
    result: s.result
  }));

  return Result.ok(scores);
}

export async function getPlayerScore(playerId) {
  const scores = await Score.findAll({ where: { playerId } });
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  return { playerId, total, scores };
}

/* =======================================
   🔹 Ranking con totalScore y winsCount
   ======================================= */
export async function getRanking(limit = 10) {
  const ranking = await Score.findAll({
    attributes: [
      'playerId',
      [Score.sequelize.fn('SUM', Score.sequelize.col('score')), 'totalScore'],
      [
        Score.sequelize.literal(
          `SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)`
        ),
        'winsCount'
      ]
    ],
    group: ['playerId', 'player.id'],
    order: [[Score.sequelize.literal('totalScore'), 'DESC']],
    limit,
    include: [
      {
        model: Player,
        as: 'player',
        required: false,
        attributes: ['id', 'nickname']
      }
    ]
  });

  return ranking.map((r) => ({
    playerId: r.player?.id,
    name: r.player?.nickname || 'Desconocido',
    totalScore: parseInt(r.get('totalScore')),
    wins: parseInt(r.get('winsCount'))
  }));
}

export async function getPlayerHistory(playerId) {
  const scores = await Score.findAll({
    where: { playerId },
    include: [
      {
        model: Game,
        required: false,
        attributes: ['id', 'title', 'status']
      }
    ]
  });

  return scores.map((s) => ({
    gameId: s.Game?.id,
    gameTitle: s.Game?.title,
    score: s.score,
    result: s.result,
    status: s.Game?.status
  }));
}

