import Swal from "sweetalert2";

// Custom styling to match "premium" aesthetic
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
  showCloseButton: true,
});

export const showAlert = (
  title,
  text,
  icon = "success",
  confirmButtonText = "OK",
) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: "#4f46e5",
    confirmButtonText,
    width: "24em",
    padding: "1.25em",
    customClass: {
      title: "text-xl font-bold",
      htmlContainer: "text-sm",
    },
    showCloseButton: true,
  });
};

export const showConfirm = (
  title,
  text,
  confirmButtonText = "Yes",
  cancelButtonText = "No",
) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#d1d5db", // Gray-300 for cancel
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    width: "24em",
    padding: "1.25em",
    customClass: {
      title: "text-xl font-bold",
      htmlContainer: "text-sm",
    },
    showCloseButton: true,
  });
};

export const showToast = (title, icon = "success") => {
  Toast.fire({
    icon,
    title,
  });
};

export default Swal;
