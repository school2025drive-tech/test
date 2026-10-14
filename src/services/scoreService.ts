import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { GameMode } from '../types/tetris';

export interface GlobalScoreRecord {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  mode: GameMode;
  score: number;
  lines: number;
  level: number;
  timeMs: number;
  createdAt: any;
}

export async function submitGlobalScore(data: {
  mode: GameMode;
  score: number;
  lines: number;
  level: number;
  timeMs: number;
}): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Must be authenticated to submit score');
  }

  const scoresRef = collection(db, 'scores');
  // Use unique ID containing timestamp and random part matching regex
  const scoreId = `score_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const docRef = doc(scoresRef, scoreId);

  const payload: Record<string, any> = {
    userId: currentUser.uid,
    userName: (currentUser.displayName || '플레이어').slice(0, 64),
    mode: data.mode,
    score: Math.max(0, Math.min(10000000, data.score)),
    lines: Math.max(0, Math.min(10000, data.lines)),
    level: Math.max(1, Math.min(100, data.level)),
    timeMs: Math.max(0, data.timeMs),
    createdAt: serverTimestamp(),
  };

  if (currentUser.photoURL) {
    payload.userPhoto = currentUser.photoURL.slice(0, 512);
  }

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `scores/${scoreId}`);
  }
}

export function subscribeGlobalScores(
  mode: GameMode,
  callback: (scores: GlobalScoreRecord[]) => void,
  limitCount = 20
): () => void {
  const scoresRef = collection(db, 'scores');

  // In sprint mode, order by timeMs ascending (fastest first), otherwise score descending
  const q =
    mode === 'SPRINT'
      ? query(
          scoresRef,
          where('mode', '==', mode),
          orderBy('timeMs', 'asc'),
          limit(limitCount)
        )
      : query(
          scoresRef,
          where('mode', '==', mode),
          orderBy('score', 'desc'),
          limit(limitCount)
        );

  return onSnapshot(
    q,
    (snapshot) => {
      const records: GlobalScoreRecord[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        records.push({
          id: docSnap.id,
          userId: item.userId,
          userName: item.userName || '플레이어',
          userPhoto: item.userPhoto,
          mode: item.mode,
          score: item.score,
          lines: item.lines,
          level: item.level,
          timeMs: item.timeMs,
          createdAt: item.createdAt,
        });
      });
      callback(records);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scores');
    }
  );
}

export async function fetchGlobalScores(
  mode: GameMode,
  limitCount = 20
): Promise<GlobalScoreRecord[]> {
  const scoresRef = collection(db, 'scores');
  const q =
    mode === 'SPRINT'
      ? query(
          scoresRef,
          where('mode', '==', mode),
          orderBy('timeMs', 'asc'),
          limit(limitCount)
        )
      : query(
          scoresRef,
          where('mode', '==', mode),
          orderBy('score', 'desc'),
          limit(limitCount)
        );

  try {
    const snapshot = await getDocs(q);
    const records: GlobalScoreRecord[] = [];
    snapshot.forEach((docSnap) => {
      const item = docSnap.data();
      records.push({
        id: docSnap.id,
        userId: item.userId,
        userName: item.userName || '플레이어',
        userPhoto: item.userPhoto,
        mode: item.mode,
        score: item.score,
        lines: item.lines,
        level: item.level,
        timeMs: item.timeMs,
        createdAt: item.createdAt,
      });
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'scores');
  }
}
