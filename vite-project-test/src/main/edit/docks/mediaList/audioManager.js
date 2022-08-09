/* eslint-disable max-classes-per-file */
// 音乐统筹管理器
// 用于调节音乐播放冲突

class AudioController {
  constructor(options) {
    this._pause = options.pause;
    this._play = options.play;
    // 被外界停止后，如可以恢复播放，是否播放，如背景音乐这种
    this.keepAlive = options.keepAlive || false;
    // 被音乐控制器强行打断
    this.breakOff = false;
    // 已经被销毁
    this.hasDestroy = false;
    this.playStateListener = () => {};
    // 当前的播放状态
    this.playState = options.playState || false;
  }

  destroy() {
    this.destroyListener();
    // 断定销毁
    this.hasDestroy = true;
  }

  // 暂停音乐播放
  pause(isTrusted = false) {
    if (this.playState === false) return;
    this._pause();
    this.changeState(false, isTrusted);
  }

  // 开始音乐播放
  play(isTrusted = false) {
    if (this.playState === true || this.hasDestroy) return;
    this._play();
    this.changeState(true, isTrusted);
  }

  // 修改音乐打断状态
  changeBreakOffState(state) {
    this.breakOff = state;
  }

  // 改变音乐播放的状态
  // isTrusted 表明该事件是由组件方发起的还是管理方发起的
  changeState(state, isTrusted = true) {
    // 如果组件方主动暂停、播放音乐，则不视为被打断
    if (isTrusted) {
      this.changeBreakOffState(false);
    }
    if (state === this.playState || this.hasDestroy) return;
    this.playState = state;
    // 状态改变触发音乐管理器监听
    this.playStateListener(state);
  }

  // 监听状态改变
  addPlayStateListener(fn) {
    this.playStateListener = fn;
  }

  // 监听组件销毁
  addDestroyListener(fn) {
    this.destroyListener = fn;
  }
}

export class AudioManager {
  constructor() {
    this.audioControllerIist = {};
    this.pauseAll = false;
    this.newId = 0;
  }

  get audioItems() {
    const { audioControllerIist } = this;
    return Object.keys(audioControllerIist).map((id) => ({ id: Number(id), controller: audioControllerIist[id] }));
  }

  register(options) {
    const controller = new AudioController(options);
    this.add(controller);
    return {
      destroy() {
        controller.destroy();
      },
      changeState(state) {
        controller.changeState(state);
      }
    };
  }

  // 为控制器 创建id
  createId() {
    const { newId } = this;
    this.newId += 1;
    return newId;
  }

  // 注入某个
  add(controller) {
    const controllerId = this.createId();
    this.audioControllerIist[controllerId] = controller;
    // 监听控制器状态
    controller.addPlayStateListener((playstate) => {
      if (playstate === false) {
        // 播放状态的取消默认
        this.pauseHandler(controllerId);
      } else {
        this.playHandler(controllerId);
      }
    });

    // 移除实例
    controller.addDestroyListener(() => {
      this.remove(controllerId);
    });
  }

  // 监听到某个音乐播放器声音关闭
  pauseHandler(id) {
    // 判断当前有没有正在播放的音乐
    const hasPlayingAudio = this.audioItems.some((item) => item.controller.playState);
    // 如果当前有所有音频都被暂停的命令，则不再挑选某被打断的音频播放，并且，所有音频为未打断状态
    if (hasPlayingAudio || this.pauseAll) return;
    // 如果没有音乐正播放，则能寻找被强行打断的音乐进行播放
    this.audioItems.some((item) => {
      const { controller } = item;
      if (item.id !== id && controller.breakOff) {
        controller.play();
        // 如果音乐开始播放则视为打断结束
        controller.changeBreakOffState(false);
      }
    });
  }

  // 监听到某个音乐播放器播放
  playHandler(id) {
    // 如果某个音频用户手动开启了播放，则判定pauseAll结束
    this.pauseAll = false;
    // 将所有正在播放的音乐暂停
    this.audioItems.forEach((item) => {
      const { controller } = item;
      if (item.id !== id && controller.playState) {
        controller.pause();
        if (controller.keepAlive) {
          controller.changeBreakOffState(true);
        }
      }
    });
  }

  // 移除音乐控制器
  remove(id) {
    // 先关掉声音
    this.audioControllerIist[id].pause();
    delete this.audioControllerIist[id];
  }

  // 暂停当前正在运行的音频，这是给组件方跨组件通信用
  pause() {
    this.pauseAll = true;
    this.audioItems.some(({ controller }) => {
      if (controller.playState) {
        controller.pause();
      }
    });
  }

  // 能够开始某一个被打断的音乐
  start() {
    this.audioItems.some((item) => {
      const { controller } = item;
      if (controller.breakOff) {
        controller.play();
        return true;
      }
      return false;
    });
  }
}

export default new AudioManager();
