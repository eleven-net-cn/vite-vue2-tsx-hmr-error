<template>
  <div class="media-upload-box">
    <el-upload
      ref="upload"
      class="media-upload-box-upload"
      :action="''"
      :disabled="fileMsg.startUpload"
      :accept="accept"
      :multiple="false"
      :show-file-list="false"
      :auto-upload="false"
      :drag="true"
      :on-change="changeFile"
      @dragover.native.stop.prevent="dragOver"
    >
      <template>
        <div v-if="fileMsg.url" class="media-upload-box-preview">
          <Media
            class="media-upload-preview-img" :type="type" :src="fileMsg.url"
            :extension="extension" :is-blob="blobUrl"
            :need-preview="false"
          />
        </div>
        <i v-else slot="default" class="el-icon-plus"></i>
        <div
          v-if="fileMsg.startUpload" class="media-upload-box-disabled-mask"
        >
          <i class="el-icon-loading"></i>
        </div>
        <i v-if="fileMsg.url" class="media-upload-box-preview-close el-icon-close" @click.stop="clearFile" />
      </template>
    </el-upload>
    <el-tooltip
      v-if="stateIcon" effect="dark" :content="stateIcon.tip"
      placement="top"
    >
      <div
        :style="{color:stateIcon.color}" :class="stateIcon.icon"
        class="media-upload-box-state-icon"
        @click="reUpload"
      >
      </div>
    </el-tooltip>
    <div v-if="fileMsg.startUpload" class="media-upload-box-process-line">
      <div class="media-upload-box-process-line-inner" :style="{width:`${fileMsg.progerss}%`}"></div>
      <div class="process-text">
        {{ `${fileMsg.progerss.toFixed(0)}%` }}
      </div>
    </div>
    <p v-if="fileMsg.name" class="file-name">
      {{ fileMsg.name }}
    </p>
  </div>
</template>

<script>
import { ossFileUpload } from 'mihoyo-file-uploader-oss';
import { RES_TYPE } from '@/constants/resource';
import Media from './media.vue';

export default {
  components: {
    Media
  },
  props: {
    accept: {
      type: String,
      default: ''
    },
    fileMsg: {
      type: Object
    },
    isBlobUrl: {
      type: Function
    },
    revokeObjectURL: {
      type: Function
    },
    extension: {
      type: String
    },
    type: {
      type: String
    }
  },
  computed: {
    blobUrl() {
      return this.isBlobUrl(this.fileMsg.url);
    },
    uploadSuccess() {
      return this.fileMsg.url && !this.blobUrl;
    },
    stateIcon() {
      if (this.uploadSuccess) {
        return {
          icon: 'el-icon-success',
          color: '#67C23A',
          tip: '上传成功'
        };
      }
      if (this.fileMsg.uploadError) {
        return {
          icon: 'el-icon-warning',
          color: 'red',
          tip: '上传失败，点击重新上传'
        };
      }
      return undefined;
    },
  },
  methods: {
    checkFileSzie(file) {
      if (!file) return true;
      const { size } = file;
      let valid = true;
      // eslint-disable-next-line default-case
      switch (this.type) {
      case RES_TYPE.IMAGE:
        if (size > 10 * 1024 * 1024) {
          this.$alert('请上传10M以内的资源!', '提示', {
            type: 'error',
          });
          valid = false;
        }
        break;
      case RES_TYPE.VIDEO:
        if (size > 100 * 1024 * 1024) {
          this.$alert('请上传100M以内的资源!', '提示', {
            type: 'error',
          });
          valid = false;
        }
        break;
      case RES_TYPE.AUDIO:
        if (size > 20 * 1024 * 1024) {
          this.$alert('请上传20M以内的资源!', '提示', {
            type: 'error',
          });
          valid = false;
        }
        break;
      }
      return valid;
    },
    async changeFile(file) {
      if (!this.checkFileSzie(file)) return;
      this.fileMsg.startUpload = true;
      // 如果之前上传操作为错误，则将错误的标记删除
      if (this.fileMsg.uploadError === true) {
        this.fileMsg.uploadError = false;
      }
      // 删除上传file的缓存
      this.$refs.upload.clearFiles();
      // 没有file参数只发生在错误后重新上传的时候
      if (file) {
        this.setFileMsgUrl(URL.createObjectURL(file.raw));
        this.fileMsg.file = file.raw;
        this.fileMsg.name = file.name;
      }
      // 为当前任务设置一个id
      this.fileMsg.uploadId += 1;
      const id = this.fileMsg.uploadId;
      let url;
      try {
        url = await this.upload(id);
      } finally {
        if (id !== this.fileMsg.uploadId) return;
        // 不管是下载完成还是下载失败标记当前任务结束
        this.cancelOrFinishCurUpload();
        if (url) {
          this.setFileMsgUrl(url);
          return;
        }
        // 标识当前为加载错误状态，但是不删除文件的各类信息，用于重新上传
        this.fileMsg.uploadError = true;
      }
    },
    // 标记当前上传任务结束了
    cancelOrFinishCurUpload() {
      this.fileMsg.uploadId += 1;
      // 将当前上传操作标记为false
      this.fileMsg.startUpload = false;
      // 将当前的进度初始化成0
      this.fileMsg.progerss = 0;
    },
    setFileMsgUrl(url) {
      // 在更换url时，将原有ObjectUrl从内存中拿掉
      this.revokeObjectURL(this.fileMsg.url);
      this.fileMsg.url = url;
    },
    // 清空文件
    clearFile() {
      // 将当前上传的文件信息全清空
      this.setFileMsgUrl('');
      this.fileMsg.file = undefined;
      this.fileMsg.name = undefined;
      this.fileMsg.uploadError = false;
      // 如果正在上传，则将id+1取消上传操作
      if (this.fileMsg.startUpload) {
        this.cancelOrFinishCurUpload();
      }
    },

    upload(id) {
      return new Promise((resolve, reject) => {
        ossFileUpload({
          biz: 'puzzle',
          async: true,
          // 注意：非公司脚手架搭建的项目需要此字段
          env: 'test',
          rowFile: this.fileMsg.file,
          onSuccess: (res) => {
            resolve(res.data.url);
          },
          onError: (err) => {
            reject(err);
          },
          onProgress: (e) => {
            if (id !== this.fileMsg.uploadId) return;
            if (!e.total) {
              this.fileMsg.progerss = 0;
              return;
            }
            this.fileMsg.progerss = e.loaded / e.total * 100 || 0;
          }
        });
      });
    },
    // 重新上传
    reUpload() {
      if (!this.fileMsg.uploadError) return;
      this.changeFile();
    },
    // 在正在上传的情况下
    dragOver(e) {
      if (this.fileMsg.startUpload) {
        e.dataTransfer.dropEffect = 'none';
      } else {
        e.dataTransfer.dropEffect = 'copy';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.media-upload-box {
  position: relative;
  padding: 12px 0;
  .media-upload-box-upload {
    position: relative;
    height: 100px;
    width: 150px;
    margin: auto;
    &::v-deep .el-upload {
      width: 100%;
      height: 100%;
    }
    &::v-deep .el-upload-dragger {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
    }
    .el-icon-plus {
      pointer-events: none;
    }
    .media-upload-box-preview {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      .media-upload-preview-img {
        pointer-events: none;
        position: absolute;
        height: 100%;
        width: 100%;
        left: 0;
        top: 0;
        object-fit: contain;
        background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==")
          0 0/5px 5px;
      }
    }
    .media-upload-box-disabled-mask {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background-color: rgba($color: #000000, $alpha: 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: not-allowed;
      font-size: 30px;
      color: white;
    }
    .media-upload-box-preview-close {
      display: none;
      position: absolute;
      right: 2px;
      top: 2px;
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
    }
  }
  .media-upload-box-upload:hover {
    .media-upload-box-preview-close {
      display: block;
    }
  }
  .media-upload-box-state-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 40px;
    font-size: 20px;
    width: 20px;
    height: 20px;
  }
  .media-upload-box-process-line {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 4px;
    background-color: #eee;
    border-radius: 2px;
    .media-upload-box-process-line-inner {
      background-color: #409eff;
      height: 100%;
      border-radius: 2px;
    }
    .process-text {
      font-size: 12px;
      color: #909399;
      position: absolute;
      left: calc(100% + 4px);
      top: 50%;
      white-space: nowrap;
      transform: translateY(-50%);
    }
  }
  .file-name {
    font-size: 14px;
    width: 80%;
    text-overflow: ellipsis;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-align: center;
    margin: auto;
  }
}
</style>
