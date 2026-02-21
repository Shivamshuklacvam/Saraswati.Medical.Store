# Saraswati Medical App Testing Guide

Follow these steps to verify the full functionality of the application.

## 1. Authentication & Role Switching
- [ ] **Register**: Create a new account. Verify you land on the **Home** screen.
- [ ] **Sign In**: Log out and sign back in.
- [ ] **Admin Login**: Use the "Admin" link on the Welcome screen. Use admin credentials.
    - *Verify: You should see the Admin Dashboard, NOT the customer Home screen.*
- [ ] **Logout**: Test the logout button on the Profile screen (Customer) and Dashboard (Admin).

## 2. Product Browsing & Search
- [ ] **Home Categories**: Click on categories like "Baby Care". Verify it Takes you to Search with filters.
- [ ] **Live Search**: Type "Para" in the search bar. Verify "Paracetamol" appears.
- [ ] **Product Detail**: Click a product. Verify all details (Price, Salt, Description) are visible.
- [ ] **Empty State**: Search for something non-existent (e.g., "XYZ123"). Verify the empty state illustration appears.

## 3. Prescription Upload
- [ ] **Access**: Go to Search screen and click the Floating Action Button "Upload Prescription".
- [ ] **Camera**: Click "Camera". Verify permissions are requested and camera opens.
- [ ] **Gallery**: Click "Gallery". Verify you can select an image.
- [ ] **Preview**: Verify the selected image shows in the preview frame.
- [ ] **Submit**: Click "Upload & Proceed". Verify the success alert appears and takes you back.

## 4. Cart & Checkout
- [ ] **Add to Cart**: Add 2-3 items from Search or Product Details.
- [ ] **Quantity**: Adjust quantity in the Cart (+/-). Verify the total price updates automatically.
- [ ] **Remove**: Click the Trash icon to clear the cart.
- [ ] **Checkout**: Proceed to checkout. 
    - [ ] Select "Home Delivery".
    - [ ] Enter a test address.
    - [ ] Click "Proceed to Checkout".
- [ ] **Order Success**: Verify you are navigated to the **Order Tracking** screen.

## 5. Profile & Settings
- [ ] **Order History**: Click "Orders & Reorder". Verify your recent order appears.
- [ ] **Add Address**: Go to "Manage Addresses". Verify your default address is pre-filled.
- [ ] **Sub-screens**: Click through "Notifications", "Help & Support", and "Payments". Verify they open correctly.

## 6. Admin Inventory
- [ ] **Search Inventory**: Search for a product in the Admin Inventory.
- [ ] **Add Product**: Click "+ Add Medicine". Fill the form and save.
    - *Check: Verify the new product now appears in the Customer Search.*
- [ ] **Edit Product**: Update a price in Admin and verify the update on the Customer side.
