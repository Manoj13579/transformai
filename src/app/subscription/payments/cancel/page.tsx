import Link from "next/link";


const Cancel = () => {
  return (
    <div className="h-screen flex justify-center items-center flex-col gap-2">
    <p className="text-2xl text-red-500">Payment Cancelled</p>
      <Link href="/userdashboard">Go to Dashboard</Link>
      </div>
  )
}
export default Cancel;