
import { useRef, useState } from "react";
import {
  UserRound,
  Pencil,
  Save,
  X,
  Camera,
  // Github,
  Code2,
  ExternalLink,
  FileText,
} from "lucide-react";
import "./Profile.css";

const initialProfile = {
  name: "Trần Đức Quân",
  studentId: "B23DCCN684",
  email: "quantd@stu.ptit.edu.vn",
  phone: "+84 967365261",
  github: "https://github.com",
  figma: "https://figma.com",
  cv: "https://drive.google.com",
};

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [formData, setFormData] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [savedAvatar, setSavedAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const [now] = useState(() => new Date());

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    setIsEditing(false);
  };

  const saveProfile = (event) => {
    event.preventDefault();

    setProfile(formData);
    setSavedAvatar(avatar);
    setIsEditing(false);
    setAvatarFile(null);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh.");
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
      return (
        <img
          src={avatar}
          alt="Ảnh đại diện"
          className="profile-avatar-image"
        />
      );
    }

    return (
      <div className="profile-avatar-placeholder">
        <UserRound size={30} />
      </div>
    );
  };

  return (
    <main className="profile-page">
      {/* <header className="profile-header">
        <div>
          <h1>Hồ sơ cá nhân</h1>
          <span>PROFILE</span>
        </div>

        <div className="profile-clock">
          <span>
            {now.toLocaleTimeString("vi-VN", {
              hour12: false,
            })}
          </span>
          <small>
            {now.toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </small>
        </div>
      </header> */}

      <section className="profile-card">
        <form onSubmit={saveProfile}>
          <div className="profile-card-actions">
            {!isEditing ? (
              <button
                type="button"
                className="profile-edit-button"
                onClick={startEditing}
              >
                <Pencil size={14} />
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={cancelEditing}
                >
                  <X size={14} />
                  Hủy
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                >
                  <Save size={14} />
                  Lưu
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
                  <Camera size={14} />
                </button>
              )}
            </div>

            {isEditing && (
              <div className="profile-avatar-controls">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn ảnh
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                  >
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

                {avatarFile && (
                  <small>{avatarFile.name}</small>
                )}
              </div>
            )}
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <label htmlFor="profile-name">TÊN</label>

              {isEditing ? (
                <input
                  id="profile-name"
                  value={formData.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  required
                />
              ) : (
                <p>{profile.name}</p>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="profile-student-id">
                MÃ SINH VIÊN
              </label>

              {isEditing ? (
                <input
                  id="profile-student-id"
                  value={formData.studentId}
                  onChange={(event) =>
                    updateField(
                      "studentId",
                      event.target.value
                    )
                  }
                  required
                />
              ) : (
                <p className="profile-monospace">
                  {profile.studentId}
                </p>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">EMAIL</label>

              {isEditing ? (
                <input
                  id="profile-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  required
                />
              ) : (
                <p className="profile-monospace">
                  {profile.email}
                </p>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="profile-phone">
                SỐ ĐIỆN THOẠI
              </label>

              {isEditing ? (
                <input
                  id="profile-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                />
              ) : (
                <p className="profile-monospace">
                  {profile.phone}
                </p>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="profile-github">
                LINK GITHUB
              </label>

              {isEditing ? (
                <input
                  id="profile-github"
                  type="url"
                  value={formData.github}
                  onChange={(event) =>
                    updateField("github", event.target.value)
                  }
                />
              ) : (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Code2 size={13} />
                  {profile.github.replace(/^https?:\/\//, "")}
                  <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="profile-figma">LINK FIGMA</label>

              {isEditing ? (
                <input
                  id="profile-figma"
                  type="url"
                  value={formData.figma}
                  onChange={(event) =>
                    updateField("figma", event.target.value)
                  }
                />
              ) : (
                <a
                  href={profile.figma}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={13} />
                  {profile.figma.replace(/^https?:\/\//, "")}
                  <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div className="profile-field profile-field-last">
              <label htmlFor="profile-cv">LINK FILE BÁO CÁO</label>

              {isEditing ? (
                <input
                  id="profile-cv"
                  type="url"
                  value={formData.cv}
                  onChange={(event) =>
                    updateField("cv", event.target.value)
                  }
                />
              ) : (
                <a
                  href={profile.cv}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileText size={13} />
                  {profile.cv.replace(/^https?:\/\//, "")}
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Profile;