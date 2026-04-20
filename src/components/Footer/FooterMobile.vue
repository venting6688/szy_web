<script setup>
function onClickLink(path) {
  const url = path.startsWith('http') ? path : 'https://www.sdzydfy.com/' + path;
  window.open(url, '_blank');
}
</script>

<template>
  <footer class="mobile-footer">
    <div class="img-box">
      <img
        src="@/assets/image/qualification.png"
        alt=""
      />
    </div>
    <!-- 版权与备案信息 -->
    <div class="footer-info">
      <p class="copyright">版权所有：山东中医药大学附属医院 山东省中医院</p>
      <p class="icp">
        ICP备案号：
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="nofollow"
          >鲁ICP备05027566号</a
        >
      </p>
      <p class="security">鲁公网安备：37010202002616号</p>
    </div>
  </footer>
</template>

<style scoped lang="less">
.mobile-footer {
  padding: clamp(16px, 5vw, 24px) clamp(12px, 4vw, 20px);
  padding-bottom: calc(clamp(16px, 5vw, 24px) + env(safe-area-inset-bottom));
  padding-top: 0;
  color: #666;
  font-size: 12px;
  line-height: 1.8;
  text-align: center;
  display: flex;
  .img-box {
    img {
      width: 50px;
      margin: 0 5px;
    }
  }
}

.footer-info {
  margin-bottom: 25px;
  padding-bottom: clamp(12px, 3.5vw, 16px);
  border-bottom: 1px solid rgb(255 255 255 / 12%);

  .copyright {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .icp a {
    color: #666;
    text-decoration: none;

    &:active {
      opacity: 0.72;
    }
  }

  .security {
    color: #666;
  }
}
</style>
