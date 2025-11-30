// The admin page will contain the listing creator and editor components as well as the customer pipeline, and the option to log out and g back to the home page.
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ListingEditor from './Listing editor/listingEditor';
import CustomerPipeline from './Customer Pipeline/customerPipeline';
import CustomListingEditor from './Custom Listing Editor/customListingEditor';

function AdminPage() {
  return (
    <div>
      <ListingEditor />
      <CustomListingEditor />
      <CustomerPipeline />
    </div>
  )
}

export default AdminPage;