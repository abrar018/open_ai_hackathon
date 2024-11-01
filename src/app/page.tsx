// pages/index.js

import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>PersonalityBot</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
        />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen bg-white font-sans">
        {/* Header Section */}
        <div className="w-full max-w-md text-center">
          {/* Profile image */}
          <div className="mb-6">
            <img
              src="images/Image.png"
              alt="Illustration of a virtual assistant"
              className="mx-auto rounded-full"
            />
          </div>

          {/* Title and subtitle */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PersonalityBot</h1>
          <p className="text-gray-600 mb-8">Engage in personality conversations with AI!</p>

          {/* Buttons */}
          <div className="flex flex-col gap-4 mb-10">
            <Link href="/chat">
            <button className="bg-lime-500 hover:bg-lime-600 text-white font-semibold py-3 px-8 rounded-full">
              Get started
            </button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-100 w-full py-10">
          <div className="max-w-2xl mx-auto text-left px-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>

            {/* FAQ Items */}
            <FAQItem
              title="More About the Interview"
              description="Discover how our AI-driven interviews are designed to understand your personality traits and provide insightful feedback."
            />
            <FAQItem
              title="The Trained Language Model"
              description="Explore the benefits of the advanced language models we use, trained on diverse datasets to ensure accurate and meaningful conversations."
            />
            <FAQItem
              title="The Report"
              description="Get detailed reports that break down your personality insights, helping you understand yourself better."
            />
            <FAQItem
              title="Why Take This Interview?"
              description="Explore the benefits of our personality interviews and how they can lead to personal growth and better self-awareness."
            />
            <FAQItem
              title="How It's Better Than Other Similar Services?"
              description="Understand what sets us apart from other personality assessment services with our unique approach and technology."
            />
          </div>
        </div>
      </main>
    </>
  );
}

interface FAQItemProps {
  title: string;
  description: string;
}

function FAQItem({ title, description }: FAQItemProps) {
  return (
    <div className="flex items-start mb-5">
      <i className="fas fa-leaf text-lime-500 mr-3 mt-1"></i>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}