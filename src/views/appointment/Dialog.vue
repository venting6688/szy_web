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
async function book(doctor) {
  appointmentInfo.value = {
    doctor: doctor.name,
    department: doctor.deptName,
    location: '暂无信息',
    price: doctor.price + '元',
    date: dayjs(doctor.date).format('YYYY-MM-DD'),
    patient: userStore.userInfo?.realName,
  };
  console.log('预约信息', appointmentInfo.value);
  dialogType.value = 'schedule';
  console.log('预约医生：', doctor);
  dialogVisible.value = true;
  await getScheduleDetail(doctor);

  // const res = await createAppointmentApi({});
  // console.log('预约挂号成功', res);
}

async function confirmBook() {
  dialogType.value = 'notice';
  console.log('确认预约', appointmentInfo.value);
}

const scheduleDetailList = ref([]);
async function getScheduleDetail(doctor) {
  const data = await getScheduleDetailApi({
    scheduleItemCode: doctor.scheduleItemCode,
    deptCode: doctor.deptCode,
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
}
function bookDisabled(item) {
  return Number(item.AvailableLeftNum) === 0;
}

defineExpose({
  book,
});
//#endregion
</script>

<template>
  <div>
    <t-dialog
      :dialog-class-name="dialogType === 'schedule' ? 'schedule-dialog' : 'notice-dialog'"
      :header="headerTitle"
      :closeBtn="true"
      :preventScrollThrough="false"
      :footer="false"
      placement="center"
      v-model:visible="dialogVisible"
    >
      <div v-show="dialogType === 'schedule'">
        <div v-if="scheduleDetailList.length > 0">
          {{ formatDate(scheduleDetailList[0].ServiceDate) }}
          {{ formatWeekDay(scheduleDetailList[0].WeekDay) }}
        </div>
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
      <div v-show="dialogType === 'appointment'">
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
              v-model="appointmentInfo.price"
            />
          </t-form-item>
          <t-form-item
            label="就诊日期"
            prop="date"
          >
            <t-input
              readonly
              v-model="appointmentInfo.date"
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
            shape="round"
            theme="primary"
            block
            @click="confirmBook"
          >
            确认预约
          </t-button>
        </div>
      </div>
      <div v-show="dialogType === 'notice'"></div>
    </t-dialog>
  </div>
</template>

<style scoped lang="less">
:deep(.schedule-dialog) {
  width: 520px;
  height: 520px;
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
</style>
