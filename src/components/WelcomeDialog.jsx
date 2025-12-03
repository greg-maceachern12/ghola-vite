import React from 'react';

const WelcomeDialog = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full mx-4">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="text-left">
          <img src="/assets/baselift.png" alt="Baselift" className="w-full mb-4 rounded-lg" />
          <h2 className="text-2xl font-bold mb-2">Introducing Baselift</h2>
          <p className="text-gray-600 mb-6">AI-powered workouts designed specifically for your goals, fitness level, and schedule.</p>
          <a
            href="https://go.baselift.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Create Your Free Workout
          </a>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDialog;
