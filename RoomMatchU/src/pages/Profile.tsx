import React, { useState } from 'react';
import { sampleListings } from '../utils/sampleListings'; // Adjust the path if needed
// import { deleteListing } from '../firebase/firebaseHelpers';

// Simulated current user ID (matches ownerId in sampleListings)
const currentUserId = 'user-1';

export default function Profile() {
  const [editMode, setEditMode] = useState(false);

  // Dummy user info
  const user = {
    fullName: 'Jane Doe',
    major: 'Computer Science',
    year: 'Junior',
  };

  // Dummy questionnaire answers
  const questionnaire = {
    cleanliness: 'Very tidy',
    sleepSchedule: '10pm - 12am',
    wakeupSchedule: '7am - 9am',
    noiseLevel: 'Background noise/music',
    visitors: 'Occasionally',
    studyHabits: 'Home',
    lifestyle: ['Cooks often', 'Vegetarian'],
  };

  // Filter only listings that belong to the mock user
  const [listings, setListings] = useState(
    sampleListings.filter((l) => l.ownerId === currentUserId)
  );

  const handleArchive = (id: string) => {
    console.log(`[ARCHIVE] Listing ID: ${id}`);
    // Backend logic can be added here
  };

  const handleDelete = (id: string) => {
    console.log(`[DELETE] Listing ID: ${id}`);
    // Backend logic can be added here
    // TODO: Hook up real delete when backend is ready
  // await deleteListing(id);
  };

  return (
    <div className="profile">
      <h1 className="text-3xl font-bold mb-4 text-center text-[#2c3e50]">Your Profile</h1>

      {/* Edit toggle */}
      <div className="text-center mb-6">
        <button
          className="text-indigo-600 underline"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Basic Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-2">Basic Info</h2>
        {editMode ? (
          <div className="space-y-2">
            <input className="w-full border p-2 rounded" value={user.fullName} readOnly />
            <input className="w-full border p-2 rounded" value={user.major} readOnly />
            <input className="w-full border p-2 rounded" value={user.year} readOnly />
          </div>
        ) : (
          <div className="space-y-1">
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Major:</strong> {user.major}</p>
            <p><strong>Year:</strong> {user.year}</p>
          </div>
        )}
      </section>

      {/* Questionnaire */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-2">Your Answers</h2>
        <div className="space-y-1">
          {Object.entries(questionnaire).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong>{' '}
              {Array.isArray(value) ? value.join(', ') : value}
            </p>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section>
        <h2 className="text-xl font-semibold text-[#2c3e50] mb-2">Your Listings</h2>
        {listings.length === 0 ? (
          <p>You have no listings yet.</p>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="border p-4 rounded shadow-sm bg-white flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{listing.title}</p>
                  <p className="text-sm text-gray-600">{listing.location}</p>
                  <p className="text-sm text-gray-600">${listing.price}/month</p>
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded"
                    onClick={() => handleArchive(listing.id)}
                  >
                    Archive
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                    onClick={() => handleDelete(listing.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
