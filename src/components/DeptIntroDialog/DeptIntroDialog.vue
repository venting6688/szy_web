<script setup>
import { ref } from 'vue';

// 二级科室简介弹窗：内容来自科室接口的 CLGRPIntraduction 字段（多学科综合门诊 / 专病门诊）
const visible = ref(false);
const title = ref('');
const content = ref('');

// intro: { title: 科室名称, content: 简介正文 }
function open(intro) {
  title.value = intro?.title || '';
  content.value = intro?.content || '';
  visible.value = true;
}

function close() {
  visible.value = false;
}

defineExpose({ open, close });
</script>

<template>
  <!-- 外层普通 div 是 scoped 样式的锚点：:deep(.t-dialog__ctx .t-dialog__position) 依赖它才能命中（与 Dialog.vue 同构） -->
  <div>
    <t-dialog
      v-model:visible="visible"
      :close-btn="false"
      :close-on-overlay-click="false"
      :footer="false"
      placement="center"
      dialog-class-name="dept-intro-dialog"
    >
      <template #header>
        <div class="header title">{{ title }}</div>
      </template>
      <!-- 正文保留后台录入的换行与空行，不做任何解析；滚动只发生在这个区块 -->
      <div class="dept-intro-body">{{ content }}</div>
      <div class="btn-container">
        <t-button
          class="btn-confirm"
          shape="round"
          theme="primary"
          block
          @click="close"
        >
          我已知晓
        </t-button>
      </div>
    </t-dialog>
  </div>
</template>

<style scoped lang="less">
// 与 Dialog.vue 的 notice-dialog 同一套骨架：固定宽度 + margin 0 20px；
// 弹窗是 .t-dialog__position 的 flex 子项，窄屏会被 flex-shrink 压缩，
// 压缩后剩下的空间正好就是左右各 20px 的边距（320 屏也成立）
:deep(.dept-intro-dialog) {
  width: 640px;
  padding: 20px 20px 0;
  margin: 0 20px;

  .header.title {
    width: 100%;
    text-align: center;
    font-size: 20px;
    color: @primary-color;
    font-weight: 600;
  }
}

// 长简介（如“青少年特发性脊柱侧弯MDT门诊”）在这个区块内滚动（与预约须知 .notice 一致），
// 弹窗总高 = 标题 + 65vh + 按钮，天然有界，标题与按钮恒定可见
.dept-intro-body {
  max-height: 65vh;
  overflow-y: auto;
  font-size: @font-base;
  line-height: 1.7;
  color: @text-regular;
  white-space: pre-wrap;
  word-break: break-word;
}

// 按钮在滚动区之外（与预约须知的 .btn-container 一致）
.btn-container {
  width: 280px;
  margin: 12px auto 16px;
  text-align: center;

  .btn-confirm {
    height: 48px;
  }
}

@media screen and (max-width: 900px) {
  // 与 Dialog.vue 预约须知一致：去掉 position 的上下 48px 留白，高度交给内容（65vh 正文 + 标题 + 按钮）
  :deep(.t-dialog__ctx .t-dialog__position) {
    padding: 0;
  }

  .btn-container {
    width: 100%;
    margin: 12px 0 16px;

    .btn-confirm {
      width: 100%;
    }
  }
}
</style>
