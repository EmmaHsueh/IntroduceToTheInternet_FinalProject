// src/components/RegistrationForm.js
import React, { useState } from 'react';

const RegistrationForm = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    user_login: '', // 對應 XML: 學號 (必填)
    user_email: '', // 對應 XML: E-mail Address (必填)
    user_password: '', // 對應 XML: 密碼 (必填)
    last_name: '', // 對應 XML: 姓氏
    first_name: '', // 對應 XML: 名字
    nickname: '', // 對應 XML: 暱稱 (可選)
    gender: '', // 對應 XML: 性別 (可選)
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 串接註冊 API
    console.log('註冊表單提交:', formData);
    alert('註冊功能待串接 API'); 
  };

  const inputStyle = { 
    width: '100%', 
    padding: '10px', 
    fontSize: '16px', 
    border: '1px solid #ddd', 
    borderRadius: '4px', 
    boxSizing: 'border-box', 
    marginBottom: '15px' 
  };
  const labelStyle = { fontSize: '16px', display: 'block', marginBottom: '5px', fontWeight: 'bold' };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ textAlign: 'center', color: 'darkgreen', marginBottom: '30px' }}>
        師大新帳號註冊
      </h3>
      <form onSubmit={handleSubmit}>
        
        <label style={labelStyle}>學號 <span style={{color: 'red'}}>*</span>:</label>
        <input type="text" name="user_login" value={formData.user_login} onChange={handleChange} style={inputStyle} required placeholder="請輸入學號" />

        <label style={labelStyle}>師大信箱 <span style={{color: 'red'}}>*</span>:</label>
        <input type="email" name="user_email" value={formData.user_email} onChange={handleChange} style={inputStyle} required placeholder="請輸入師大信箱" />

        <label style={labelStyle}>密碼 <span style={{color: 'red'}}>*</span>:</label>
        <input type="password" name="user_password" value={formData.user_password} onChange={handleChange} style={inputStyle} required placeholder="請設定密碼" />

        {/* 姓名欄位 - 依照 XML 結構 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>姓氏:</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} style={inputStyle} placeholder="姓" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>名字:</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} style={inputStyle} placeholder="名" />
          </div>
        </div>
        
        <label style={labelStyle}>暱稱 (匿名可選):</label>
        <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} style={inputStyle} placeholder="可選擇是否使用匿名" />

        {/* 性別 (Radio) */}
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>性別:</label>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '20px' }}>
            <input type="radio" name="gender" value="男性" checked={formData.gender === '男性'} onChange={handleChange} /> 男性
          </label>
          <label>
            <input type="radio" name="gender" value="女性" checked={formData.gender === '女性'} onChange={handleChange} /> 女性
          </label>
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: 'darkgreen', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '18px' }}>
          註冊帳號
        </button>
      </form>
      
      {/* 切換到登入模式 */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ margin: '10px 0' }}>已經有帳號了？</p>
        <button 
            onClick={switchToLogin} 
            type="button" 
            style={{ padding: '8px 15px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
            前往登入
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;