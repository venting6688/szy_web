// src/api/user.js
import { MessagePlugin } from 'tdesign-vue-next';
import { post, get } from '@/utils/request';

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
    hospitalId: 'SZYBTQYQ',
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
    return data;
  }
}

// 登录
export async function loginApi(params) {
  const { idCard, password, ...rest } = params;
  const { code, msg, data } = await post('/mobile/miniProgramLogin', {
    loginType: 'web',
    hospitalId: 'SZYBTQYQ',
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
  if (code !== 200) {
    MessagePlugin.error(msg || '更新个人信息失败');
    throw new Error(msg || '更新个人信息失败');
  } else {
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
  const { code, msg, data } = await post('/mobile/changePassword', {
    oldPassword,
    newPassword,
    confirmPassword,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '修改密码失败');
    throw new Error(msg || '修改密码失败');
  } else {
    return data;
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
