// src/api/user.js
import { MessagePlugin } from 'tdesign-vue-next';
import { post, get } from '@/utils/request';
const hospitalId = import.meta.env.VITE_HOSPITAL_ID;
import { useUserStore } from '@/store/modules/user';
// import { useHospitalStore } from '@/store/modules/hospital';
const userStore = useUserStore();
import router from '@/router';

export async function registerApi(params) {
  const {
    idType,
    idCard,
    realName,
    birthday,
    gender,
    phoneNumber,
    verificationCode,
    nation,
    province,
    city,
    district,
    detailAddress,
    password,
    confirmPassword,
  } = params;
  const { code, msg, data } = await post('/mobile/webRegister', {
    hospitalId,
    registerSource: 'H5',
    idType,
    idCard,
    realName,
    birthday,
    gender,
    phoneNumber,
    verificationCode,
    nation,
    province,
    city,
    district,
    detailAddress,
    password,
    confirmPassword,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '注册失败');
    throw new Error(msg || '注册失败');
  } else {
    MessagePlugin.success(msg || '注册成功');
    return data;
  }
}

// 登录
export async function loginApi(params) {
  const { idCard, password, ...rest } = params;
  const { code, msg, data } = await post('/mobile/miniProgramLogin', {
    loginType: 'web',
    hospitalId,
    idCard,
    password,
    ...rest,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '登录失败');
    throw new Error(msg || '登录失败');
  } else {
    return data;
  }
}

// 发送短信验证码
export async function sendYunMsgApi(params) {
  const { type, phone, ...rest } = params;
  const { code, msg, data } = await post('/mobile/api/sendYunMsg', {
    type,
    phone,
    ...rest,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '发送短信验证码失败');
  } else {
    return data;
  }
}

// api/dict/all 获取字典数据
export async function getDictDataApi() {
  const { code, msg, data } = await get('/mobile/api/dict/all');
  if (code !== 200) {
    MessagePlugin.error(msg || '获取字典数据失败');
    throw new Error(msg || '获取字典数据失败');
  } else {
    return data;
  }
}

// 更新个人信息 updateProfile
// {
//   "idCard": "370***************",
//   "realName": "张三",
//   "phonenumber": "13800138000",
//   "address": "山东省济南市历下区xx路xx号"
// }
export async function updateProfileApi({ idCard, realName, phonenumber, address }) {
  const { code, msg, data } = await post('/mobile/updateProfile', {
    idCard,
    realName,
    phonenumber,
    address,
  });
  if (code === 401) {
    MessagePlugin.error('登录过期，请重新登录');
    userStore.logout();
    router.push('/login');
    throw new Error(msg + '登录过期，请重新登录');
  }
  if (code !== 200) {
    MessagePlugin.error(msg || '更新个人信息失败');
    throw new Error(msg || '更新个人信息失败');
  } else {
    MessagePlugin.success('更新个人信息成功');
    return data;
  }
}

/**
 * 获取家庭列表与默认就诊人（个人中心「当前就诊人」的数据来源）
 * @param {*} userId 登录用户 id
 * @returns 家庭列表（含默认就诊人）
 */
export async function getFamilyListApi(userId) {
  const { code, msg, data } = await get('/mobile/getFamilyList', { userId });
  if (code !== 200) {
    MessagePlugin.error(msg || '获取就诊人信息失败');
    throw new Error(msg || '获取就诊人信息失败');
  } else {
    return data;
  }
}

/**
 * 更新就诊人信息（院方新接口，手机号变更需带短信验证码）
 * @param {*} phonenumber 手机号
 * @param {*} verificationCode 短信验证码
 * @param {*} address 家庭住址（完整地址，省市区由接口返回）
 * @returns 更新结果
 * @description 入参以院方示例请求为准，在此由表单值 + 登录用户信息映射而来
 */
export async function updatePatientInfoApi({ phonenumber, verificationCode, address }) {
  const { userInfo } = userStore;
  // 家庭列表返回的 address 已是完整地址（省 市 区 详细地址），直接按表单值提交，避免重复拼接省市区
  const addressText = address || userInfo.address || '';
  const { code, msg, data } = await post('/mobile/api/dh/patient/userInfo/update', {
    PatName: userInfo.realName || '',
    PatBirth: userInfo.birthday || '',
    PatientID: userInfo.patientId || '',
    PatSex: userInfo.gender || '',
    IDType: userInfo.idType || '',
    IDNo: userInfo.idCard || '',
    profileId: userInfo.profileId,
    contactName: '',
    contactIDNo: '',
    contactIDType: '',
    contactTelNo: '',
    Address: addressText,
    TelephoneNo: phonenumber,
    verifyCode: verificationCode,
  });
  if (code === 401) {
    MessagePlugin.error('登录过期，请重新登录');
    userStore.logout();
    router.push('/login');
    throw new Error(msg + '登录过期，请重新登录');
  }
  if (code !== 200) {
    MessagePlugin.error(msg || '更新个人信息失败');
    throw new Error(msg || '更新个人信息失败');
  } else {
    MessagePlugin.success('更新个人信息成功');
    return data;
  }
}

/**
 * 修改密码
 * @param {*} oldPassword 旧密码
 * @param {*} newPassword 新密码
 * @param {*} confirmPassword 确认新密码
 * @returns 修改密码结果
 * @description 修改用户密码
 */
//完善updatePasswordApi函数的实现，添加具体的API调用逻辑
export async function updatePasswordApi({ oldPassword, newPassword, confirmPassword }) {
  const { code, msg } = await post('/mobile/changePassword', {
    oldPassword,
    newPassword,
    confirmPassword,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '修改密码失败');
    throw new Error(msg || '修改密码失败');
  } else {
    return true;
  }
}
/**
 * 忘记密码
 * @param {*} idCard 身份证号
 * @param {*} verificationCode 短信验证码
 * @param {*} password 新密码
 * @param {*} confirmPassword 确认新密码
 * @returns 忘记密码结果
 * @description 忘记用户密码
 */
export async function forgetPasswordApi({ idCard, phone, verificationCode, newPassword, confirmPassword }) {
  const { code, msg, data } = await post('/mobile/forgotPassword', {
    idCard,
    phone,
    verificationCode,
    newPassword,
    confirmPassword,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '忘记密码失败');
    throw new Error(msg || '忘记密码失败');
  } else {
    return data;
  }
}
