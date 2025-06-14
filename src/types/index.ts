export type Topic = {
  id: number;
  name: string;
}

export type Word = {
  id: number;
  topicId: number;
  text: string;
  reading: string;
}

export type WordPracticeRecord = {
  id: number;
  wordId: number;
  inputText: string;
  keystrokeTimes: number[];
  practiceDate: Date;
}

export type PracticalPracticeRecord = {
  id: number;
  startTime: Date;
  endTime: Date;
  kpm: number;
  rkpm: number;
  inputCharacters: number;
  missCount: number;
}