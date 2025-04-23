import { useState } from 'react';
import { postListing } from '../firebase/firebaseHelpers';

export default function PostListing() {
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    neighborhood: '',
    beds: '',
    baths: '',
    availableDate: '',
    price: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const listingId = await postListing(formData);
      alert(`Listing submitted! ID: ${listingId}`);
      console.log('Successfully posted:', listingId);
    } catch (error) {
      console.error('Failed to submit listing:', error);
      alert('Failed to submit listing. Check console for details.');
    }
  };

  return (
    <div className="post-listing-page">
      <h1>Post A Listing</h1>
      <form onSubmit={handleSubmit} className="post-listing-form">
        <label>
          Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>

        <label>
          Short Bio / Description:
          <textarea name="bio" value={formData.bio} onChange={handleChange} required />
        </label>

        <label>
          Neighborhood:
          <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} required />
        </label>

        <label>
          Number of Beds:
          <input type="number" name="beds" value={formData.beds} onChange={handleChange} required />
        </label>

        <label>
          Number of Bathrooms:
          <input type="number" name="baths" value={formData.baths} onChange={handleChange} required />
        </label>

        <label>
          Available Date:
          <input type="date" name="availableDate" value={formData.availableDate} onChange={handleChange} required />
        </label>

        <label>
          Price per Month ($):
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        </label>

        <button type="submit">Submit Listing</button>
      </form>
    </div>
  );
}
