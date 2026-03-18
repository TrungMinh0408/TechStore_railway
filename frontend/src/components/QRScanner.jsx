// import { useState } from "react";
// import { useZxing } from "react-zxing";

// export default function QRScanner({ onScan }) {

//   const [result, setResult] = useState("");

//   const { ref } = useZxing({
//     onDecodeResult(decodedResult) {

//       const text = decodedResult.getText();

//       setResult(text);

//       console.log("QR:", text);

//       if (onScan) {
//         onScan(text);
//       }
//     }
//   });

//   return (
//     <div className="p-4 bg-white rounded-xl shadow">

//       <h2 className="text-lg font-bold mb-3">
//         Quét QR
//       </h2>

//       <video
//         ref={ref}
//         className="w-full rounded-lg border"
//       />

//       {result && (
//         <p className="mt-3 text-sm text-gray-600">
//           QR: <b>{result}</b>
//         </p>
//       )}

//     </div>
//   );
// }