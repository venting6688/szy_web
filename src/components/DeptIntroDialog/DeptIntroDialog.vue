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
    <!-- 正文保留后台录入的换行与空行，不做任何解析 -->
    <div class="dept-intro-body">{{ content }}</div>
    <div class="dept-intro-footer">
      <t-button
        class="btn-ok"
        theme="primary"
        @click="close"
      >
        我已知晓
      </t-button>
    </div>
  </t-dialog>
</template>

<style scoped lang="less">
:deep(.dept-intro-dialog) {
  width: calc(100vw - 32px);
  max-width: 640px;
  padding: 20px;

  .header.title {
    width: 100%;
    text-align: center;
    font-size: 20px;
    color: @primary-color;
    font-weight: 600;
  }
}

// 长简介（如“青少年特发性脊柱侧弯MDT门诊”）在窗口内滚动，标题与底部按钮恒定可见
.dept-intro-body {
  max-height: 65vh;
  overflow-y: auto;
  font-size: @font-base;
  line-height: 1.7;
  color: @text-regular;
  white-space: pre-wrap;
  word-break: break-word;
}

.dept-intro-footer {
  display: flex;
  justify-content: center;
  margin-top: @space-lg;

  .btn-ok {
    width: 280px;
    height: 44px;
  }
}

@media screen and (max-width: 900px) {
  :deep(.t-dialog__ctx .t-dialog__position) {
    padding: 0;
  }
  .dept-intro-body {
    max-height: 60vh;
  }
}
</style>
