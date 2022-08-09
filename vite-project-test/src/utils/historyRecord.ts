import debounce from 'lodash/debounce';

export interface IHistoryRecordOptions {
  maxStack?: number; // default to 1000
  delay?: number; // ms, default to 100
}

export class HistoryRecord {
  records: string[];

  current: number;

  maxStack: number;

  delay: number;

  constructor({
    maxStack = 1000,
    delay = 100
  } = {} as IHistoryRecordOptions) {
    this.records = [] as string[];
    this.current = -1;
    this.maxStack = maxStack;
    this.delay = delay;
  }

  static diff(data1, data2) {
    return data1 === data2;
  }

  init(initState: string) {
    this.records.push(initState);
    this.current += 1;
  }

  clear() {
    this.records = [] as string[];
    this.current = -1;
  }

  push(data: string, { force = false, immediate = false } = {}) {
    // console.log('push: ', this.records.map(item => JSON.parse(item)), this.current);
    if (!force) {
      const changed = HistoryRecord.diff(data, this.records[this.current]);
      if (!changed) {
        return;
      }
    }

    const doPush = () => {
      if (this.current !== this.records.length - 1) {
        this.records.splice(this.current + 1);
      }
      this.records.push(data);
      this.current += 1;

      if (this.records.length > this.maxStack) {
        this.records.shift();
        this.current -= 1;
      }
    };

    const debouncedDoPush = debounce(doPush, this.delay);
    if (!immediate) {
      debouncedDoPush();
    } else {
      doPush();
    }
  }

  undo() {
    // console.log('undo: ', this.records.map(item => JSON.parse(item)), this.current);
    if (this.current < 1) {
      return null;
    }
    this.current -= 1;
    return this.records[this.current];
  }

  redo() {
    // console.log('redo: ', this.records.map(item => JSON.parse(item)), this.current);
    if (this.current === this.records.length - 1) {
      return null;
    }
    this.current += 1;
    return this.records[this.current];
  }
}

const historyRecord = new HistoryRecord();
export default historyRecord;
