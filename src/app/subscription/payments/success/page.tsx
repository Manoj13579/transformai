import Link from "next/link";


const Success = () => {
  return (
    <div className="h-screen flex justify-center items-center flex-col gap-2">
      <p className="text-2xl text-green-500">Success Payment</p>
      <Link href="/userdashboard">Go to Dashboard</Link>
      </div>
  )
}
export default Success; 