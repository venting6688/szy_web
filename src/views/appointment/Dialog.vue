<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import dayjs from 'dayjs';
import { getScheduleDetailApi } from '@/api/schedule';

onMounted(() => {
  console.log('Component mounted!');
});

//#region 预约
// 弹窗类型
// schedule: 选择预约时间
// appointment: 确认预约
// notice: 预约挂号通知
const dialogType = ref('schedule');
const headerTitle = computed(() => {
  if (dialogType.value === 'schedule') return '选择号源';
  if (dialogType.value === 'appointment') return '预约信息';
  if (dialogType.value === 'notice') return '预约须知';
  return '';
});
// 时间格式化
import { useUserStore } from '@/store/modules/user';
const userStore = useUserStore();

const formatTime = (time) => time.slice(0, 5);
const dialogVisible = ref(false);
const appointmentInfo = ref();
const doctorCardInfo = ref();
async function book(doctor, period) {
  doctorCardInfo.value = { ...doctor, period };
  appointmentInfo.value = {
    doctor: doctorCardInfo.value.name,
    department: doctorCardInfo.value.deptName,
    location: '暂无信息',
    price: doctorCardInfo.value.price,
    date: dayjs(doctorCardInfo.value.date).format('YYYY-MM-DD'),
    patient: userStore.userInfo?.realName,
  };
  console.log('预约信息', appointmentInfo.value);
  dialogType.value = 'schedule';
  console.log('预约医生：', doctorCardInfo.value);
  dialogVisible.value = true;
  activeTab.value = period;
  await getScheduleDetail();
}
// 可能的值：上午、下午、晚上
const activeTab = ref('');

const scheduleDetailList = ref([]);
async function getScheduleDetail() {
  const data = await getScheduleDetailApi({
    scheduleItemCode: doctorCardInfo.value.schedule.find((item) => item.period === activeTab.value)?.scheduleItemCode,
    deptCode: doctorCardInfo.value.deptCode,
  });
  console.log('获取号源', data);
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
  console.log('点击时间', item);
  dialogType.value = 'appointment';
  appointmentInfo.value.startTime = item.StartTime;
  appointmentInfo.value.endTime = item.EndTime;
  appointmentInfo.value.scheduleItemCode = item.ScheduleItemCode;
}
function bookDisabled(item) {
  return Number(item.AvailableLeftNum) === 0;
}
// #region 确认预约
import { createAppointmentApi } from '@/api/appointment';
import { MessagePlugin } from 'tdesign-vue-next';
async function confirmBook() {
  console.log('确认预约', appointmentInfo.value);

  const res = await createAppointmentApi({
    ScheduleItemCode: appointmentInfo.value.scheduleItemCode,
    PayFee: appointmentInfo.value.price,
    StartTime: appointmentInfo.value.startTime,
    EndTime: appointmentInfo.value.endTime,
  });
  console.log('预约挂号成功', res);
  MessagePlugin.success('预约挂号成功');
}
// 跳转预约须知
function goNotice() {
  dialogType.value = 'notice';
}
const onClickClose = () => {
  dialogType.value = 'schedule';
};
// #endregion

const noticeList = [
  {
    text: '1.每天18:00点开放号源，您可预约一周之内的号源。',
  },
  {
    text: '2.我院实行实名制预约，预约时请使用患者真实信息，否则无法就诊;预约成功后请于就诊当天提前15分钟到医院取预约号。',
    type: 'highlight',
  },
  {
    text: '首次就诊需建档：',
    type: 'title',
  },
  {
    text: '1.首次就诊的医保患者请携带身份证原件及医保卡或医保电子凭证到人工机取预约号，去各诊区侯诊;窗口建档、充值，自助机取预约号，持医保卡或医保电子凭证到诊区候诊;',
  },
  {
    text: '2.自费患者或儿童请携带身份证原件或健康码到自助机建档、充值，自助',
  },
  {
    text: '3.预约时请您填写有效的联系方式(最好是随身手机号)，以方便您在就诊程中能收到短信提示。',
  },
  {
    text: '4.如遇特殊情况不能如约就诊时,请提前一天取消，否则视为违约。如果一个月违约累计3次或同一账号一周取消累计6次，系统将自动锁定，半年内无法预约;如果一天取消3次，则当日无法预约。',
  },
  {
    text: '5.挂号当日有效，坐诊医生因应急、突发事件等原因可能会有变动，以当日实际坐诊医生为准，敬请谅解。',
  },
  {
    text: '6.电话预约0531-82166666，受理时间每天上午8:00-11:30;下午13:30-17:00。预约电话0531-82168888(节假日除外)',
  },
  {
    text: '7.【停车温馨提示】医院停车资源紧张，为避免广大患者因停车滞留时间长而延误就诊，您可将车辆停在医院周边的停车场，或乘坐公共交通工具来院就诊,谢谢。',
  },
];

defineExpose({
  book,
});
//#endregion
</script>

<template>
  <div>
    <t-dialog
      :dialog-class-name="dialogType === 'notice' ? 'notice-dialog' : 'schedule-dialog'"
      :closeBtn="true"
      :preventScrollThrough="false"
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
              v-for="item in doctorCardInfo.schedule"
              :key="item.ScheduleItemCode"
              :value="item.period"
              :label="item.period"
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
                readonly
                v-model="appointmentInfo.doctor"
              />
            </t-form-item>
            <t-form-item
              label="就诊科室"
              prop="department"
            >
              <t-input
                readonly
                v-model="appointmentInfo.department"
              />
            </t-form-item>
            <t-form-item
              label="科室地点"
              prop="location"
            >
              <t-input
                readonly
                v-model="appointmentInfo.location"
              />
            </t-form-item>
            <t-form-item
              label="诊查费"
              prop="price"
            >
              <t-input
                readonly
                :value="appointmentInfo.price + '元'"
              />
            </t-form-item>
            <t-form-item
              label="就诊日期"
              prop="date"
            >
              <t-input
                readonly
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
                readonly
                v-model="appointmentInfo.patient"
              />
            </t-form-item>
          </t-form>
          <div class="btn-container">
            <t-button
              class="btn-confirm"
              shape="round"
              theme="primary"
              block
              @click="confirmBook"
            >
              确认预约
            </t-button>
            <div>
              点击查看<a
                @click="goNotice"
                style="cursor: pointer"
                >《预约须知》</a
              >
            </div>
          </div>
        </div>
        <div v-show="dialogType === 'notice'">
          <div class="notice">
            <div
              v-for="(item, i) in noticeList"
              :key="i"
              class="line"
              :class="item.type"
            >
              {{ item.text }}
            </div>
            <div class="btn-container">
              <t-button
                class="btn-confirm"
                shape="round"
                theme="primary"
                block
                @click="onClickClose"
              >
                我已知晓
              </t-button>
            </div>
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
    margin: 15px 0;
  }
  .schedule-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
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

.btn-container {
  margin: 30px auto 0;
  width: 280px;
  text-align: center;
  .btn-confirm {
    height: 48px;
    margin: 10px 0;
  }
}

:deep(.notice-dialog) {
  width: 520px;
  padding: 20px;
  .header.title {
    width: 100%;
    text-align: center;
    font-size: 20px;
    color: @primary-color;
    font-weight: 600;
  }
}
.notice {
  line-height: 1.6;
  color: @text-regular;

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
