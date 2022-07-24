export const truncate = (str:string, len: number) => {
    if (str.length > len) {
       if (len <= 3) {
          return str.slice(0, len - 3) + "...";
       }
       else {
          return str.slice(0, len) + "...";
       };
    }
    else {
       return str;
    };
 };