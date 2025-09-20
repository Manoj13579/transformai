'use client'
import { getSubscriber } from "@/actions/subscriber.action";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Subscriber {
  userId: string;
    isSubscribed: boolean;
    customerId: string;
}

export default function Shell({ children}: React.PropsWithChildren) {
 const [subscriberData, setSubscriberData] = useState<Subscriber>()
    const { data: session } = useSession();
    const user = session?.user;
    const router = useRouter();

  const getSubscriberInClient = async () => {
  try {
     //cookie are automatically sent to actions
    const response = await getSubscriber();
    if (response) {
      setSubscriberData(response);
    }
  } catch (error: any) {
    if (error.response?.status === 403) {
      toast.error(error.response.data.message);
    }
  }
};

const editPayment = async () => {
  try {
    const response = await axios.post("/api/subscription/edit-payment", {
      userId: user?.id,
    }, { withCredentials: true });

    if (response.data?.url) {
      window.location.href = response.data.url; // redirect
    } 
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 400 || error.response?.status === 404) {
      toast.error(error.response.data.message);
    }
    else {
      toast.error("Error opening customer portal");
      console.error(error);
    }
  }
};


useEffect(() => {
    getSubscriberInClient();
  }, []);


  return (
    <div className="min-h-dvh bg-background text-foreground p-8">
      <div className="md:pl-72">
        <header className="sticky top-0 z-30 border-b bg-background/75 backdrop-blur">
          <div className="container flex h-14 items-center justify-between">
            <Link href="/userdashboard" className="text-base font-semibold" >Transform AI</Link>
            <div>
              {subscriberData?.isSubscribed || subscriberData?.customerId ? (
    <>
      {subscriberData?.isSubscribed && subscriberData?.customerId
        ? 'You are subscribed'
        : (!subscriberData?.isSubscribed && subscriberData?.customerId
        ? 'Please update your subscription details'
        : null)}
      <Button
        onClick={editPayment}
        className="inline-block rounded-lg bg-blue-600 p-2 ml-2 text-center text-white"
      >
        Edit Payment Details
      </Button>
    </>
  ) : (
    <Link href="/subscription/packages" className="inline-block rounded-lg bg-blue-600 p-2 text-center text-white">Subscribe</Link>
  )}
            </div>
          </div>
        </header>
        <main className="container py-6">{children}</main>
      </div>
    </div>
  );
}