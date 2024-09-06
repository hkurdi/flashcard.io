import Swal from 'sweetalert2';

export function sendAlert(text: string): void {
    Swal.fire({
        title: 'Alert',
        text: text,
        icon: 'info',
        confirmButtonText: 'OK'
    });
}

export function sendCheckAlert(text: string): void {
    Swal.fire({
        title: 'Success',
        text: text,
        icon: 'success',
        confirmButtonText: 'Great!'
    });
}

export function sendErrorAlert(text: string): void {
    Swal.fire({
        title: 'Error',
        text: text,
        icon: 'error',
        confirmButtonText: 'Try Again'
    });
}
