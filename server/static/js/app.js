function Prompt() {
  let toast = function (c) {
    const { msg = '', icon = 'success', position = 'top-end' } = c;

    const Toast = Swal.mixin({
      toast: true,
      title: msg,
      position,
      icon,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({});
  };

  let sucess = function (c) {
    const { msg = '', title = '', footer = '' } = c;

    Swal.fire({
      icon: 'success',
      title,
      text: msg,
      footer,
    });
  };
  let error = function (c) {
    const { msg = '', title = '', footer = '' } = c;

    Swal.fire({
      icon: 'error',
      title,
      text: msg,
      footer,
    });
  };

  async function custom(c) {
    const { icon = '', msg = '', title = '', showConfirmButton = true } = c;

    const { value: formValues } = await Swal.fire({
      icon,
      title,
      html: msg,
      backrop: false,
      focusConfirm: false,
      showCancelButton: true,
      showConfirmButton,
      focusConfirm: false,
      willOpen: () => {
        if (c.willOpen !== undefined) {
          c.willOpen();
        }
      },
      didOpen: () => {
        if (c.didOpen !== undefined) {
          c.didOpen();
        }
      },
    });
    if (formValues) {
      if (formValues.dismiss !== Swal.DismissReason.cancel) {
        if (formValues.value !== '') {
          if (c.callback !== undefined) {
            c.callback(formValues);
          } else {
            c.callback(false);
          }
        }
      } else {
        c.callback(false);
      }
    }
  }

  return {
    toast,
    sucess,
    error,
    custom,
  };
}
