<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';

onMounted(() => {
  console.log('sf');
});
</script>

<template>
  <!-- <div>
    <header>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <br />
        <RouterLink to="/appointment">Appointment</RouterLink>
      </nav>
    </header>
    <router-view />
  </div> -->
  <div>
    <router-view />
    <t-layout>
      <t-header id="pc-header" height="350px">
        <div id="header-top"></div>
        <div id="header-image"></div>
      </t-header>

      <t-layout>
        <t-aside style="border-top: 1px solid var(--component-border)">
          <t-menu>
            <t-menu-item value="0">
              <template #icon>
                <t-icon name="app" />
              </template>
              仪表盘
            </t-menu-item>

            <t-submenu value="1" title="资源列表">
              <template #icon>
                <t-icon name="code" />
              </template>
              <t-menu-item value="1-1" disabled>
                <span>菜单二</span>
              </t-menu-item>
            </t-submenu>
            <t-submenu value="2" title="调度平台">
              <template #icon>
                <t-icon name="file" />
              </template>
              <t-submenu value="2-1" title="二级菜单-1">
                <t-menu-item value="3-1">三级菜单-1</t-menu-item>
                <t-menu-item value="3-2">三级菜单-2</t-menu-item>
                <t-menu-item value="3-3">三级菜单-3</t-menu-item>
              </t-submenu>
              <t-menu-item value="2-2">
                <span>二级菜单-2</span>
              </t-menu-item>
            </t-submenu>
          </t-menu>
        </t-aside>
        <t-layout>
          <t-content>
            <div>Content</div>
          </t-content>
        </t-layout>
      </t-layout>
      <t-footer id="pc-footer">
        <div style="display: flex; justify-content: space-around; align-items: center; width: 50%">
          <div>
            <div>版权所有：山东中医药大学附属医院 山东省中医院</div>
            <div>ICP备案号：鲁ICP备05027566号</div>
            <div>鲁公网安备：37010202002616号</div>
          </div>
          <div>
            <div>联系我们：0532-88888888</div>
            <div>邮箱：123@qq.com</div>
          </div>
        </div>
      </t-footer>
    </t-layout>
  </div>
</template>

<style scoped lang="less">
#pc-header {
  height: 350px;
  #header-top {
    height: 50px;
    width: 100%;
    background-color: #555555;
  }
  #header-image {
    height: 200px;
    width: 100%;
    background-image: url('https://www.zhishanjijin.cn/Upload/ueditor/image/20240423/1713840942695782.jpg');
    background-size: cover;
    background-position: center;
  }
}

#pc-footer {
  height: 100px;
  width: 100%;
  background-color: #555555;
  color: rgb(255, 255, 255);
}
</style>
