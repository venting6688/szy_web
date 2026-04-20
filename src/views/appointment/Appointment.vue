<script setup>
import dayjs from 'dayjs';
import DoctorCard from '@/components/DoctorCard/DoctorCard.vue';
import downIcon from '@/assets/image/down.png';
import rightIcon from '@/assets/image/right.png';
import Dialog from '@/views/appointment/Dialog.vue';
import { useAppointmentData } from '@/composables/useAppointmentData';

const {
  type,
  currentDept,
  dates,
  currentDate,
  onlyAvailable,
  loading,
  format,
  displayDoctors,
  firstDeptList,
  secondDeptMap,
  openDept,
  onClickDept,
  currentSecondDept,
  onClickSecondDept,
  isAvailable,
  hospitalOptions,
  hospitalId,
  onChangeHospital,
  onClickDate,
  dialogRef,
  noticeDialogRef,
  bookEmit,
  weekDayMap,
  openNoticeDialog,
} = useAppointmentData();
</script>
<template>
  <div class="page">
    <div class="header">
      <div class="header-left">
        <div class="title">预约挂号</div>
        <div class="info">
          <!-- <span>请先选择院区再选择对应的临床科室进行挂号登记</span> -->
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-bar">
        <t-select
          v-model="hospitalId"
          @change="onChangeHospital"
          size="large"
          style="width: 500px"
        >
          <t-option
            v-for="item in hospitalOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </t-select>

        <!-- <t-input
          input-class="search-input"
          :style="{ width: '560px' }"
          placeholder="搜索科室"
          v-model="searchDept"
          size="large"
        >
          <template #suffix>
            <t-button theme="primary"
              >搜索<template #icon><search-icon /></template
            ></t-button>
          </template>
        </t-input> -->
      </div>
    </div>

    <div class="content">
      <!-- 左侧科室 -->
      <div class="left">
        <div
          v-for="item in firstDeptList"
          :key="item.CliSerGroupID"
          class="dept-group"
        >
          <!-- 一级 -->
          <div
            class="dept-item level-1"
            :class="{ active: currentDept === item.CliSerGroupID }"
            @click="onClickDept(item)"
          >
            <!-- 图标 -->
            <img
              class="icon"
              :src="openDept === item.CliSerGroupID ? downIcon : rightIcon"
            />

            {{ item.CliSerGroupName }}
          </div>

          <!-- 二级 -->
          <div
            v-if="openDept === item.CliSerGroupID"
            class="dept-children"
          >
            <div
              v-for="child in secondDeptMap[item.CliSerGroupID] || []"
              :key="child.CLGRPRowId"
              class="dept-item level-2"
              :class="{ active: currentSecondDept === child.CLGRPRowId }"
              @click="onClickSecondDept(child)"
            >
              {{ child.CLGRPDesc }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="right">
        <!-- 日期 -->
        <div
          v-if="type === 'appointment'"
          class="date-bar"
        >
          <div
            v-for="d in dates"
            :key="d"
            class="date-item"
            :class="{ active: currentDate === d }"
            @click="onClickDate(d)"
          >
            <div class="week-day">{{ dayjs(d).isSame(dayjs(), 'day') ? '今天' : weekDayMap[dayjs(d).day()] }}</div>
            <div>{{ format(d) }}</div>
            <!-- 可用号源 -->
            <div
              class="sub"
              :class="{ unavailable: !isAvailable(d) }"
            >
              {{ isAvailable(d) ? '有号' : '无号' }}
            </div>
          </div>
        </div>

        <!-- 标题 -->
        <div class="title flex justify-between">
          <span>{{ format(currentDate) }} 坐诊医生</span>
          <div>
            <span style="color: #666">只看有号 </span>

            <t-switch
              v-model="onlyAvailable"
              label=""
            />
          </div>
        </div>

        <!-- 医生列表 -->
        <div class="doctor-list">
          <!-- loading -->
          <div
            v-if="loading"
            class="loading"
          >
            <t-loading
              v-if="loading"
              :delay="50"
              size="small"
            ></t-loading>
            加载中...
          </div>

          <!-- 空状态 -->
          <div
            v-else-if="!displayDoctors.length"
            class="empty"
          >
            <t-empty
              description="该日期暂无医生排班"
              title="暂无数据"
            >
            </t-empty>
          </div>

          <!-- 正常列表 -->
          <div
            v-else
            class="doctor-list-item"
            v-for="doc in displayDoctors"
            :key="doc.code"
          >
            <DoctorCard
              :doctor="doc"
              @book="bookEmit"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 预约弹窗 -->
    <Dialog
      ref="dialogRef"
      @open="openNoticeDialog"
    />
    <Dialog ref="noticeDialogRef" />
  </div>
</template>
<style scoped lang="less">
.page {
  background: @bg-page;
  padding: @space-xl;
}

.breadcrumb {
  color: @text-secondary;
  margin-bottom: @space-lg;
  font-size: @font-base;
}

.content {
  display: flex;
}

.left {
  width: 260px;
  border-right: 1px solid @border-color;

  .dept-group {
    background: @bg-white;
    border-bottom: 1px solid @border-light;
  }

  .dept-item {
    display: flex;
    align-items: center;
    gap: @space-sm;
    padding: @space-md;
    cursor: pointer;
    font-size: @font-base;
    color: @text-regular;
    transition: all 0.2s;

    .icon {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: @primary-color-fade;
    }
  }

  /* 一级 */
  .level-1 {
    font-weight: 500;
    &.active {
      background: @primary-color;
      color: #fff;
      font-weight: 500;
    }
  }

  .level-2 {
    padding-left: 36px;
    font-size: @font-base;
    color: @text-regular;

    &:hover {
      color: @primary-color;
    }
    &.active {
      background: @primary-color-fade;
      color: @primary-color;
      font-weight: 500;
      border-right: 2px solid #20857e;
    }
  }

  .dept-children {
    background: #fafafa;
  }
}

.right {
  width: calc(100% - 260px);
  flex: 1;
  padding-left: @space-xl;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  .title {
    font-size: 24px;
    font-weight: 800;
  }
  .info {
    line-height: 14px;
    font-size: @font-base;
    font-weight: 400;
    color: @text-regular;
  }
  .search-bar {
    display: flex;
    gap: @space-md;
    margin-bottom: @space-lg;
    .search-input {
      width: 560px;
      button {
        border-radius: 8px;
      }
    }
  }
}

.date-bar {
  display: flex;
  gap: @space-md;
  margin-bottom: @space-lg;
  justify-content: space-between;

  .date-item {
    width: 13%;
    border: 1px solid @border-color;
    padding: @space-sm @space-md;
    cursor: pointer;
    border-radius: 7px;
    text-align: center;
    min-width: 80px;
    transition: all 0.2s;
    background: @bg-white;

    &:hover {
      border-color: @primary-color;
    }

    &.active {
      background: @primary-color;
      color: #fff;
      border-color: @primary-color;
      .sub {
        color: inherit;
        &.unavailable {
          color: inherit;
        }
      }
      .week-day {
        color: inherit;
      }
    }

    .sub {
      font-size: @font-small;
      color: @success-color;
      margin-top: @space-xs;
      &.unavailable {
        color: @text-secondary;
      }
    }
    .week-day {
      font-size: @font-base;
      color: @text-regular;
      margin-bottom: @space-xs;
    }
  }
}

.title {
  margin-bottom: @space-md;
  font-size: @font-medium;
  color: @text-primary;
  font-weight: 500;
}

.doctor-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 0 auto;
  .doctor-list-item {
    width: 49%;
  }
  .loading,
  .empty {
    width: 100%;
    text-align: center;
    margin-top: 100px;
  }
}
</style>
