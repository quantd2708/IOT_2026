import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Code2,
  ExternalLink,
  FileText,
  Mail,
  Pencil,
  Phone,
  Save,
  Send,
  UserRound,
  X,
} from "lucide-react";
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
} from "../../services/profileService";
import "./Profile.css";

const emptyProfile = {
  name: "", studentId: "", email: "", phone: "", course: "", className: "",
  github: "", figma: "", postman: "", cv: "", avatar: "",
};

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [formData, setFormData] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [avatar, setAvatar] = useState("");
  const [savedAvatar, setSavedAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  
  const fileInputRef = useRef(null);

  const applyProfile = (p) => {
    setProfile(p);
    setFormData(p);
    setAvatar(p.avatar);
    setSavedAvatar(p.avatar);
    setAvatarFile(null);
  };

  useEffect(() => {
    fetchProfile()
      .then(applyProfile)
      // .catch(() => setError("Không kết nối được server"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const startEditing = () => {
    setFormData(profile);
    setAvatar(savedAvatar);
    setIsEditing(true);
  };

    const cancelEditing = () => {
      setFormData(profile);
      setAvatar(savedAvatar);
      setAvatarFile(null);
      setError("");          // thêm dòng này
      setIsEditing(false);
    };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      let updated = await updateProfile(formData);

      if (avatarFile) {
        updated = await uploadAvatar(avatarFile);
      } else if (!avatar && savedAvatar) {
        updated = await deleteAvatar(); // người dùng đã bấm "Xóa ảnh"
      }

      applyProfile(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Không lưu được, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh tối đa 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setAvatarFile(file);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar("");
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderAvatar = () => {
    if (avatar) {
      return <img src={avatar} alt="Ảnh đại diện" className="profile-avatar-image" />;
    }
    return (
      <div className="profile-avatar-placeholder">
        <UserRound size={42} />
      </div>
    );
  };

  const renderLink = (icon, label, value) => {
    if (isEditing) {
      return (
        <div className="profile-link-edit">
          {icon}
          <input
            type="url"
            value={formData[value]}
            onChange={(event) => updateField(value, event.target.value)}
          />
        </div>
      );
    }

    return (
      <a href={profile[value]} target="_blank" rel="noreferrer" className="profile-resource-link">
        <div className="profile-resource-icon">{icon}</div>
        <div className="profile-resource-content">
          <span className="profile-resource-label">{label}</span>
          <span className="profile-resource-value">{profile[value].replace(/^https?:\/\//, "")}</span>
        </div>
        <ExternalLink size={15} />
      </a>
    );
  };

  if (loading) {
    return (
      <main className="profile-page">
        <p style={{ padding: 24 }}>Đang tải...</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-container">
        <form id="profile-form" onSubmit={saveProfile} className="profile-grid">
          {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
          
          <div className="profile-left">
            <section className="profile-card profile-identity-card">
              <div className="profile-card-actions">
                {!isEditing ? (
                  <button
                    type="button"
                    className="profile-icon-button profile-edit-trigger"
                    onClick={startEditing}
                    title="Chỉnh sửa hồ sơ"
                    aria-label="Chỉnh sửa hồ sơ"
                  >
                    <Pencil size={14} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="profile-icon-button profile-cancel-trigger"
                      onClick={cancelEditing}
                      title="Hủy"
                      aria-label="Hủy"
                    >
                      <X size={14} />
                    </button>
                    <button
                      type="submit"
                      form="profile-form"
                      className="profile-icon-button profile-save-trigger"
                      title="Lưu thay đổi"
                      aria-label="Lưu thay đổi"
                      disabled={saving}
                    >
                      <Save size={14} />
                    </button>
                  </>
                )}
              </div>

              <div className="profile-avatar-area">
                <div className="profile-avatar-wrap">
                  {renderAvatar()}
                  {isEditing && (
                    <button
                      type="button"
                      className="profile-avatar-edit"
                      onClick={() => fileInputRef.current?.click()}
                      title="Thay ảnh đại diện"
                    >
                      <Camera size={15} />
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div className="profile-avatar-controls">
                    <button type="button" onClick={() => fileInputRef.current?.click()}>
                      Chọn ảnh
                    </button>
                    {avatar && (
                      <button type="button" onClick={removeAvatar}>
                        Xóa ảnh
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      hidden
                    />
                    {avatarFile && <small>{avatarFile.name}</small>}
                  </div>
                )}
              </div>

              <div className="profile-identity-info">
                {isEditing ? (
                  <input
                    className="profile-name-input"
                    value={formData.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                  />
                ) : (
                  <h2>{profile.name}</h2>
                )}

                <div className="profile-student-id">
                  <span>MÃ SINH VIÊN</span>
                  {isEditing ? (
                    <input
                      value={formData.studentId}
                      onChange={(event) => updateField("studentId", event.target.value)}
                      required
                    />
                  ) : (
                    <strong>{profile.studentId}</strong>
                  )}
                </div>
              </div>
            </section>

            <section className="profile-card contact-card">
              <div className="section-heading">
                <div>
                  <h3>Thông tin liên hệ</h3>
                </div>
              </div>

              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon">
                    <Mail size={16} />
                  </div>
                  <div className="contact-content">
                    <label>EMAIL</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        required
                      />
                    ) : (
                      <a href={`mailto:${profile.email}`}>{profile.email}</a>
                    )}
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <Phone size={16} />
                  </div>
                  <div className="contact-content">
                    <label>SỐ ĐIỆN THOẠI</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                      />
                    ) : (
                      <a href={`tel:${profile.phone}`}>{profile.phone}</a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="profile-card profile-resources-card">
            <div className="resource-section">
              <div className="section-heading">
                <div>
                  <h3>Thông tin học phần</h3>
                </div>
              </div>

              <div className="course-info">
                <div className="course-item">
                  <span>TÊN HỌC PHẦN</span>
                  {isEditing ? (
                    <input
                      value={formData.course}
                      onChange={(event) => updateField("course", event.target.value)}
                    />
                  ) : (
                    <strong>{profile.course}</strong>
                  )}
                </div>

                <div className="course-item">
                  <span>LỚP</span>
                  {isEditing ? (
                    <input
                      value={formData.className}
                      onChange={(event) => updateField("className", event.target.value)}
                    />
                  ) : (
                    <strong>{profile.className}</strong>
                  )}
                </div>
              </div>
            </div>

            <div className="resource-divider" />

            <div className="resource-section">
              <div className="section-heading">
                <div>
                  <h3>Liên kết dự án</h3>
                </div>
              </div>

              <div className="resource-list">
                {renderLink(<Code2 size={17} />, "GitHub", "github")}
                {renderLink(<ExternalLink size={17} />, "Figma", "figma")}
                {renderLink(<Send size={17} />, "Postman", "postman")}
                {renderLink(<FileText size={17} />, "Báo cáo", "cv")}
              </div>
            </div>
          </section>
        </form>
      </section>
    </main>
  );
}

export default Profile;