<template>
  <div class="layout">
    <!-- 顶部栏 -->
    <div class="topbar">
      <div class="container flex justify-between items-center">
        <div class="logo">互联网医院</div>
        <div class="user flex items-center gap-3">
          <span>欧阳朵朵</span>
          <t-button size="small" theme="warning">退出</t-button>
        </div>
      </div>
    </div>

    <!-- Banner -->
    <div class="banner">
      <img src="@/assets/hospital.jpg" />
    </div>

    <!-- 导航 -->
    <div class="nav">
      <div class="container flex justify-around">
        <div class="nav-item">首页</div>
        <div class="nav-item active">当日挂号</div>
        <div class="nav-item">预约挂号</div>
        <div class="nav-item">预约记录</div>
        <div class="nav-item">个人中心</div>
      </div>
    </div>

    <!-- 主体 -->
    <div class="main container">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="less">
.layout {
  background: #f5f7fa;
}

/* 顶部栏 */
.topbar {
  height: 60px;
  background: #2f8f83;
  color: #fff;
}

/* Banner */
.banner {
  height: 220px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* 导航 */
.nav {
  background: #fff;
  height: 70px;
  border-bottom: 1px solid #eee;

  .nav-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #666;

    &.active {
      color: #2f8f83;
      border-bottom: 2px solid #2f8f83;
    }
  }
}

/* 主体 */
.main {
  padding: 20px 0;
}

/* 容器 */
.container {
  width: 1200px;
  margin: 0 auto;
}
</style>
