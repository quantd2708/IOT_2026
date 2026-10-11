import api from "./api";

export async function fetchProfile() {
  const { data } = await api.get("/profile");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.put("/profile", payload);
  return data;
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file); // tên "avatar" phải khớp .single("avatar") ở backend
  const { data } = await api.post("/profile/avatar", form);
  return data;
}

export async function deleteAvatar() {
  const { data } = await api.delete("/profile/avatar");
  return data;
}