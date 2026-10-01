<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import dayjs from 'dayjs';
import { getScheduleDetailApi } from '@/api/schedule';
const emit = defineEmits(['open']);

//#region 预约
// 弹窗类型
// schedule: 选择预约时间
// appointment: 确认预约
// notice: 预约须知
const dialogType = ref('schedule');
const submitting = ref(false);
const headerTitle = computed(() => {
  if (dialogType.value === 'schedule') return '选择号源';
  if (dialogType.value === 'appointment') return '预约信息';
  if (dialogType.value === 'notice') return '预约须知';
  if (dialogType.value === 'notice2') return '温馨提示';
  return '';
});
// 预约信息弹窗内嵌了温馨提示，高度需随内容自适应，故单独使用一个弹窗类名
const dialogClassName = computed(() => {
  if (dialogType.value === 'notice' || dialogType.value === 'notice2') return 'notice-dialog';
  if (dialogType.value === 'appointment') return 'appointment-dialog';
  return 'schedule-dialog';
});
// 时间格式化
import { useUserStore } from '@/store/modules/user';
const userStore = useUserStore();

const formatTime = (time) => time.slice(0, 5);
const dialogVisible = ref(false);
const appointmentInfo = ref();
const doctorCardInfo = ref();
async function book(doctor, scheduleItemCode) {
  doctorCardInfo.value = { ...doctor };
  // 不同时段（上午/下午/晚上）挂号费可能不同，取所点击时段的价格
  const periodItem = doctorCardInfo.value.schedule?.find((item) => item.scheduleItemCode === scheduleItemCode);
  appointmentInfo.value = {
    doctor: doctorCardInfo.value.name,
    department: doctorCardInfo.value.deptName,
    location: '暂无信息',
    price: periodItem?.price ?? doctorCardInfo.value.price,
    date: dayjs(doctorCardInfo.value.date).format('YYYY-MM-DD'),
    patient: userStore.userInfo?.realName,
  };
  dialogType.value = 'schedule';
  dialogVisible.value = true;
  activeTab.value = scheduleItemCode;
  await getScheduleDetail();
}
// 可能的值：上午、下午、晚上、全天
const activeTab = ref('');

const scheduleDetailList = ref([]);
async function getScheduleDetail() {
  // 切换时段后同步刷新价格，避免诊查费/ PayFee 仍沿用上一个时段的价格
  const periodItem = doctorCardInfo.value?.schedule?.find((item) => item.scheduleItemCode === activeTab.value);
  if (periodItem && appointmentInfo.value) {
    appointmentInfo.value.price = periodItem.price ?? doctorCardInfo.value.price;
  }

  const data = await getScheduleDetailApi({
    scheduleItemCode: activeTab.value,
    deptCode: doctorCardInfo.value.deptCode,
  });

  scheduleDetailList.value = data;
}
const weekDayMap = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日',
};
const formatWeekDay = (weekDay) => weekDayMap[weekDay] || '未知';
const formatDate = (date) => dayjs(date).format('YYYY年MM月DD日');

function onClickBookTime(item) {
  dialogType.value = 'appointment';
  appointmentInfo.value.startTime = item.StartTime;
  appointmentInfo.value.endTime = item.EndTime;
  appointmentInfo.value.scheduleItemCode = item.ScheduleItemCode;
}
function bookDisabled(item) {
  if (Number(item.AvailableLeftNum) === 0) return true;
  // 预约结束时间已过则不可再预约
  return dayjs(`${item.ServiceDate} ${item.EndTime}`).isBefore(dayjs());
}
// #region 确认预约
import { createAppointmentApi } from '@/api/appointment';
import { MessagePlugin } from 'tdesign-vue-next';
async function confirmBook() {
  if (submitting.value) return;

  try {
    submitting.value = true;
    const res = await createAppointmentApi({
      ScheduleItemCode: appointmentInfo.value.scheduleItemCode,
      PayFee: appointmentInfo.value.price,
      StartTime: appointmentInfo.value.startTime,
      EndTime: appointmentInfo.value.endTime,
      RegisterDate: appointmentInfo.value.date,
      doctorName: appointmentInfo.value.doctor,
      departmentName: appointmentInfo.value.department,
    });

    // MessagePlugin.success('预约挂号成功');
    dialogVisible.value = false;
  } catch (error) {
    console.error('预约挂号失败', error);
  } finally {
    submitting.value = false;
  }
}
// 跳转预约须知
function goNotice(type = 'notice') {
  // dialogType.value = 'notice';
  // noticeDialogRef.value.openNotice();

  emit('open', type);
}
function onClickClose() {
  // if (dialogType.value === 'notice') {
  //   dialogType.value = 'schedule';
  // }
  dialogVisible.value = false;
}
// #endregion

const noticeList1 = [
  {
    text: '1、我院实行实名制预约、就诊制度，就诊人应使用本人姓名、身份信息进行预约、就诊，务必做到人证相符。',
  },
  {
    text: '2、跨省异地医保患者首次就诊，请提前通过国家医保服务平台APP办理异地就医备案；持身份证、医保卡、电子健康卡、电子医保码均可取号就诊，异地医保（省外、省内异地）患者每次就诊前请至人工收费窗口办理医保关联，并按预约时间提前取号候诊。',
  },
  {
    text: '3、无上述证件者，可凭户口本等有效证件至收费窗口办理就诊卡。',
  },
  {
    text: '4、外籍人士、华侨、境外归国无内地身份证的中国公民可凭护照至收费窗口办理就诊卡。',
  },
  {
    text: '5、国际医疗部（特需门诊）费用均为自费，请合理选择。',
  },
  {
    text: '6、我院门诊专家、普通号源均可以通过：山东中医药大学附属医院微信公众号、官方网站（www.sdzydfy.com)、支付宝：山东中医药大学附属医院、预约电话等方式进行预约。预约成功后请于就诊当天提前10分钟到医院自助机取预约号等待就诊。',
  },
  {
    text: '7、若您需要诊断证明、病休证明，请在就诊时主动告知医生，医生开具后可至自助机打印，然后到门诊楼一楼病员服务中心加盖公章。',
  },
  {
    text: '8、开放号源时间为晚上8点（例如: 本周周一晚20:00开放下周二的号源）。每天早上8:00官方预约热线0531-58675126，0531-96558电话预约放号，您可预约一周之内的号源。',
  },
  {
    text: '9、如遇特殊情况不能如约就诊时，请于就诊前一天24点前取消预约，否则视为违约。同一账号，一天内取消预约3次，则当日无法再预约，如半年内累计违约达到3次或一周内累计取消预约达到6次，系统将限制该账号线上预约。',
  },
  {
    text: '10、患者迟到超过1小时，须顺延至预约医生当日出诊时段的最后进行就诊。',
  },
  {
    text: '11、为提供更优质高效的服务，预约时请您务必提供真实有效的手机号码，以便及时接收验证码、预约确认、停诊通知等系统短信。',
  },
  {
    text: '12、坐诊医生因应急、突发事件等原因可能会有工作安排变动，以当日实际坐诊医生为准，敬请谅解。',
  },
  {
    text: '13、慢病患者开药请到慢病管理中心：东区慢病管理中心位于扁鹊楼五楼。',
  },
  {
    text: '14、我院实行门诊号源全预约制度，专家门诊及普通门诊号源全部放开预约，预约剩余号源自动转到医师坐诊当日现场，若号源已约满则现场无号；除部分科室（儿科、小儿推拿科、小儿骨科、生殖与遗传科、产科）外，其他科室诊次医院预留了部分老年人专属号源，若老年人预留号源没有预约，现场患者也可以在医院各诊区自助机进行现场选号，当日预约和现场选号不再限制患者年龄。',
  },
  {
    text: '15、我院官网开设互联网医院，线上咨询，为不便来院患者提供便利。线上就诊流程：选择医生→填写问诊信息→线上支付→等待医生接诊→问诊结束→查看诊断报告。',
  },
];
const noticeList2 = [
  {
    text: '请在预约时间之前携带身份证完成就诊卡/医保卡实名认证后取号。',
  },
  {
    text: '跨省异地医保患者首次就诊，请提前从国家医保平台app进行联网备案，再到自助取号机取号候诊',
  },
  {
    text: '七天内如需取消预约，请在就诊日前一日0点之前操作；当日预约：上午号源操作需在11点之前进行，下午号源操作需在16点30分之前进行；当日取消：请在就诊时间点之前操作。',
  },
  {
    text: '医院东院区车位相对充足，西院区就诊高峰期间车位比较紧张。请广大患者根据需求合理选择出行方式，感谢您的理解和配合。',
  },
];

const noticeReachedBottom = ref(false);
const noticeRef = ref(null);

function checkNoticeScroll() {
  const el = noticeRef.value;
  if (!el) return;
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 5) {
    noticeReachedBottom.value = true;
  }
}

function openNotice(type = 'notice') {
  console.log(type);
  dialogType.value = type;
  dialogVisible.value = true;
  noticeReachedBottom.value = false;
  nextTick(checkNoticeScroll);
}

const getNoticeList = computed(() => {
  return dialogType.value === 'notice' ? noticeList1 : noticeList2;
});
defineExpose({
  book,
  openNotice,
});
//#endregion
</script>

<template>
  <div>
    <t-dialog
      :dialog-class-name="dialogClassName"
      :closeBtn="dialogType === 'notice' || dialogType === 'notice2' ? false : true"
      :footer="false"
      placement="center"
      v-model:visible="dialogVisible"
    >
      <template #header>
        <div class="header title">{{ headerTitle }}</div>
      </template>
      <div v-if="dialogVisible">
        <div v-if="dialogType === 'schedule'">
          <div
            v-if="scheduleDetailList.length > 0"
            class="schedule-date"
          >
            {{ formatDate(scheduleDetailList[0].ServiceDate) }}
            {{ formatWeekDay(scheduleDetailList[0].WeekDay) }}
          </div>
          <t-tabs
            v-model="activeTab"
            @change="getScheduleDetail"
          >
            <t-tab-panel
              v-for="(item, index) in doctorCardInfo.schedule"
              :key="item.scheduleItemCode + index"
              :value="item.scheduleItemCode"
              :label="item.period"
              :disabled="item.ScheduleStatusDesc === '停诊' || item.left <= 0"
            >
            </t-tab-panel>
          </t-tabs>
          <div class="schedule-list">
            <t-button
              v-for="item in scheduleDetailList"
              :key="item.ScheduleItemCode"
              :class="{ 'btn-book': true, disabled: bookDisabled(item) }"
              variant="outline"
              shape="round"
              @click="!bookDisabled(item) && onClickBookTime(item)"
            >
              {{ formatTime(item.StartTime) }} - {{ formatTime(item.EndTime) }}
            </t-button>
          </div>
        </div>
        <div
          v-if="dialogType === 'appointment'"
          class="appointment-dialog-container"
        >
          <t-form>
            <t-form-item
              label="预约医生"
              prop="doctor"
            >
              <t-input
                disabled
                v-model="appointmentInfo.doctor"
              />
            </t-form-item>
            <t-form-item
              label="就诊科室"
              prop="department"
            >
              <t-input
                disabled
                v-model="appointmentInfo.department"
              />
            </t-form-item>
            <t-form-item
              label="科室地点"
              prop="location"
            >
              <t-input
                disabled
                v-model="appointmentInfo.location"
              />
            </t-form-item>
            <t-form-item
              label="诊查费"
              prop="price"
            >
              <t-input
                disabled
                :value="
                  appointmentInfo.price !== null && appointmentInfo.price !== undefined
                    ? appointmentInfo.price + '元'
                    : '暂无信息'
                "
              />
            </t-form-item>
            <t-form-item
              label="就诊日期"
              prop="date"
            >
              <t-input
                disabled
                :value="
                  appointmentInfo.date +
                  ' ' +
                  formatTime(appointmentInfo.startTime) +
                  ' - ' +
                  formatTime(appointmentInfo.endTime)
                "
              />
            </t-form-item>
            <t-form-item
              label="就诊人"
              prop="patient"
            >
              <t-input
                disabled
                v-model="appointmentInfo.patient"
              />
            </t-form-item>
          </t-form>
          <div class="appointment-notice">
            <div class="notice-title">温馨提示</div>
            <div class="notice-greeting">尊敬的患者及家属：</div>
            <div
              v-for="(item, i) in noticeList2"
              :key="i"
              class="line"
              v-html="item.text"
            ></div>
          </div>
          <div class="btn-container">
            <t-button
              class="btn-confirm"
              shape="round"
              theme="primary"
              block
              :loading="submitting"
              :disabled="submitting"
              @click="confirmBook"
            >
              确认预约
            </t-button>
            <div>
              点击查看<a
                @click="goNotice('notice')"
                style="cursor: pointer"
                >《预约须知》</a
              >
            </div>
          </div>
        </div>
        <div v-show="dialogType === 'notice' || dialogType === 'notice2'">
          <div
            ref="noticeRef"
            class="notice"
            @scroll="checkNoticeScroll"
          >
            尊敬的患者及家属：
            <div
              v-for="(item, i) in getNoticeList"
              :key="i"
              class="line"
              v-html="item.text"
            ></div>
          </div>
          <div class="btn-container">
            <p class="notice-tip">请滚动至底部，阅读完须知后方可点击</p>
            <t-button
              class="btn-confirm"
              shape="round"
              theme="primary"
              block
              :disabled="!noticeReachedBottom"
              @click="onClickClose"
            >
              我已知晓
            </t-button>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<style scoped lang="less">
:deep(.schedule-dialog) {
  width: 520px;
  height: 520px;
  padding: 20px;
  .schedule-date {
    margin: 10px 0 0;
  }
  margin: 0 20px;
  .schedule-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 20px;
    max-height: 320px;
    overflow: auto;
    .btn-book {
      width: 104px;
      height: 32px;
      background: @primary-color-fade;
      color: @primary-color;
      border-radius: 16px;
      border: 0;
      &.disabled {
        background-color: #f5f5f5;
        color: #999;
        border-color: #999;
        cursor: not-allowed;
      }
    }
  }
}

// 预约信息弹窗：宽度上限 640px，窄屏自动收敛到视口内；不设固定高度，内容多高就多高，超出屏幕时由遮罩层滚动
:deep(.appointment-dialog) {
  width: calc(100vw - 32px);
  max-width: 640px;
  padding: 20px;
}

// 预约信息弹窗内嵌的温馨提示：浅底卡片 + 层次化排版，避免与上方表单糊成一堵灰墙
.appointment-notice {
  margin: 16px 0 0;
  padding: 12px 14px;
  background: @primary-color-fade;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: @text-regular;
  .notice-title {
    font-weight: 600;
    color: @text-primary;
  }
  .notice-greeting {
    margin-top: 6px;
  }
  .line {
    margin-top: 6px;
  }
}

.btn-container {
  margin: 10px auto 0;
  width: 280px;
  text-align: center;
  .notice-tip {
    margin: 0 0 8px;
    font-size: 12px;
    color: @text-secondary;
  }
  .btn-confirm {
    height: 48px;
    margin: 10px 0;
  }
}

:deep(.notice-dialog) {
  width: 520px;
  padding: 20px 20px 0 20px;
  margin: 0 20px;
  .header.title {
    width: 100%;
    text-align: center;
    font-size: 20px;
    color: @primary-color;
    font-weight: 600;
  }
}
@media screen and (max-width: 900px) {
  :deep(.t-dialog__ctx .t-dialog__position) {
    padding: 0;
  }
  .notice {
    height: 65vh;
    overflow: auto;
  }
}
.notice {
  line-height: 1.6;
  color: @text-regular;
  max-height: 65vh;
  overflow-y: scroll;
  .line {
  }

  .highlight {
    color: #ff7d04;
    font-weight: 500;
  }

  .title {
    color: @primary-color;
    font-weight: 600;
    margin-top: @space-xs;
  }
}
</style>
