const GeneralToastrRules = {
  closeButton: true,
  timeOut: 3000,
  easing: 'linear',
  progressBar: true,
};
export const SuccessConfig = {
  ...GeneralToastrRules,
  toastClass: 'ngx-toastr w-[200px] h-[70px] !bg-sky-400',
};
export const FailConfig = {
  ...GeneralToastrRules,
  toastClass: 'ngx-toastr w-[200px] h-[70px]  !bg-red-400',
};
