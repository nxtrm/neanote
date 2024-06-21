import { toast } from 'react-toastify';

export function  showToast(t,m){

    if(t=='e'){

        toast.error(m, {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            progress: undefined,
            theme: "colored",
            });
        }



    if(t=='s'){
            toast.success(m, {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });


            }

         

          

    
}