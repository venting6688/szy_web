<script setup>
function onClickLink(path) {
  const url = path.startsWith('http') ? path : 'https://www.sdzydfy.com/' + path;
  window.open(url, '_blank');
}
</script>

<template>
  <div>
    <footer
      class="footer"
      id="footer"
    >
      <div
        class="links"
        id="links"
      >
        <div class="layout clearfix">
          <ul class="linklist clearfix fl">
            <li>
              <a href="javascript:;">友情链接:</a>
            </li>

            <li>
              <a
                href="http://wsjkw.shandong.gov.cn/"
                target="_blank"
                >山东省卫生健康委员会</a
              >
            </li>

            <li>
              <a
                href="http://www.sdutcm.edu.cn/"
                target="_blank"
                >山东中医药大学</a
              >
            </li>

            <li>
              <a
                href="http://www.natcm.gov.cn/"
                target="_blank"
                >国家中医药管理局</a
              >
            </li>

            <li>
              <a
                href="http://www.nhc.gov.cn/"
                target="_blank"
                >国家卫健委</a
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-info">
        <div class="layout">
          <div class="footer-info-top">
            <div class="left-info fl clearfix">
              <a
                href="https://bszs.conac.cn/sitename?method=show&amp;id=54014916AC404303E053012819ACE0DE"
                target="_blank"
                class="fl institution-logo"
              >
                <img
                  class="img-fluid"
                  src="@/assets/image/qualification.png"
                  alt=""
                />
              </a>
              <div class="site-info fl">
                <p>
                  <u>版权所有：</u>山东中医药大学附属医院 山东省中医院<br />
                  <u>ICP备案号：</u><a href="https://beian.miit.gov.cn/">鲁ICP备05027566号</a><br />
                  <u>鲁公网安备：</u>37010202002616号<br />
                </p>
              </div>
            </div>

            <div class="right-info fr">
              <div class="address-left fl">
                <p class="site-address"><u>咨询诉求管理中心电话(工作时间)：</u>0531-68616666</p>
                <p class="site-address"><u>咨询电话(节假日及非工作日时间)：</u>0531-68616619，0531-68617822</p>
                <p class="site-address"><u>西院区地址：</u>山东省济南市文化西路42号 邮编：250011</p>
                <p class="site-address"><u>东院区地址：</u>山东省济南市经十路16369号 邮编：250014</p>
                <p class="site-address"><u>预约电话：</u>0531-58675126</p>
              </div>
              <div class="qr-code fr clearfix">
                <a
                  href="#"
                  target="_blank"
                  rel="nofollow"
                >
                  <img
                    src="https://www.sdzydfy.com/oss/20220926/183557369.jpg"
                    alt=""
                  />
                  <span>医院微信服务号</span>
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="nofollow"
                >
                  <img
                    src="https://www.sdzydfy.com/oss/20221031/093800382.jpg"
                    alt=""
                  />
                  <span>内部办公企业号</span>
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="nofollow"
                >
                  <img
                    src="https://www.sdzydfy.com/oss/20220926/183509968.jpg"
                    alt=""
                  />
                  <span>医院微信订阅号</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="clearfix footlinks">
        <div class="layout footlinks-content">
          <div class="footlinks-item clearfix">
            <a
              @click="onClickLink('/sitemap')"
              title="网站地图"
              >网站地图</a
            >

            <a
              @click="onClickLink('/yiyuanjianjie')"
              title="关于我们"
              >关于我们</a
            >
          </div>
          <div class="right-author">
            <u>技术支持</u>：<a
              href="https://www.chinzsoft.com/"
              target="_blank"
              title=""
              >山东钦泽软件有限公司</a
            >
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="less">
.footer {
  background-color: #555555;
  .links {
    position: relative;
    min-height: 50px;
    line-height: 50px;
    background-color: #7f7f7f;
    .linklist li {
      float: left !important;
      > a {
        display: block;
        color: #fff;
        font-weight: 400;
        font-style: normal;
        font-size: 14px;
      }
      + li {
        margin-left: 30px;
      }
    }
  }
  .footer-info {
    padding: 40px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    .footer-info-top {
      display: flex;
      justify-content: space-between;
      > div {
        flex-shrink: 0;
      }
    }
    .left-info {
      overflow: hidden;
      a.institution-logo {
        display: block;
        img {
          width: 90px;
        }
      }
      .site-info {
        margin-left: 20px;
        p {
          color: #fff;
          font-size: 14px;
          line-height: 28px;
          u {
            color: #c4c4c4;
          }
          a {
            color: #fff;
            &:hover {
              color: @warning-color;
              background: transparent;
            }
          }
        }
      }
    }
    .right-info {
      margin-left: 40px;
      color: #fff;
      display: flex;
      .address-left p {
        font-size: 14px;
        line-height: 28px;
        color: #fff;
        u {
          color: #c4c4c4;
        }
      }
      .qr-code {
        width: 330px;
        a {
          display: block;
          float: right;
          width: 90px;
          color: #fff;
          text-align: center;
          margin-left: 20px;
        }
      }
    }
  }
  .footlinks {
    height: 50px;
    line-height: 50px;
    .footlinks-content {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    .footlinks-item {
      a {
        cursor: pointer;
        position: relative;
        float: left;
        color: #fff;
        &:hover {
          background: transparent;
        }
        &:first-child {
          &::after {
            content: '|';
            margin-left: 15px;
            width: 1px;
            height: 12px;
            color: #fff;
          }
        }
      }
    }
    .footlinks-item a + a {
      margin-left: 15px;
    }
    .right-author {
      color: #c4c4c4;
      font-size: 12px;
      a {
        color: #fff;
      }
    }
  }

  .layout {
    width: 90%;
    max-width: 1300px;
    margin: 0 auto;
  }
  .fl {
    float: left !important;
  }
}
.clearfix {
  *zoom: 1;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
  line-height: 0;
  font-size: 0;
  clear: both;
}

a,
u {
  text-decoration: none;
}
</style>
