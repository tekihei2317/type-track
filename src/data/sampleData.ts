import type { Topic, Word } from '../types';

export const sampleTopics: Topic[] = [
  { id: 1, name: '元気が出る言葉' },
  { id: 2, name: '基本練習' },
];

export const sampleWords: Word[] = [
  { id: 1, topicId: 1, text: '案外できるものだよ', reading: 'あんがいできるものだよ' },
  { id: 2, topicId: 1, text: '大丈夫、きっとうまくいく', reading: 'だいじょうぶ、きっとうまくいく' },
  { id: 3, topicId: 2, text: 'hello world', reading: 'hello world' },
  { id: 4, topicId: 2, text: 'programming', reading: 'programming' },
];