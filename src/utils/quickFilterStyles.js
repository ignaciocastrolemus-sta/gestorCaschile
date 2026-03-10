export function quickFilterBtn(active) {
  return {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: active ? "#BFD4FF" : "#D9E5FF",
    backgroundColor: active ? "#E8F0FF" : "#fff",
  };
}

export function quickFilterText(active) {
  return { fontWeight: "900", color: active ? "#1D4ED8" : "#374151", fontSize: 12 };
}
