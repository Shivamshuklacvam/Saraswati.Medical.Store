# Saraswati Medical App Navigation Tree

This document illustrates the navigation structure of the application for both Customers and Admins.

## App Flow Overview

```mermaid
graph TD
    %% Entry Point
    Start((App Start)) --> Welcome{Welcome Screen}
    
    %% Auth Flow
    Welcome -->|Guest| Search[Search Screen]
    Welcome -->|Sign In| SignIn[Sign In Screen]
    Welcome -->|Register| Register[Register Screen]
    Welcome -->|Admin| AdminSignIn[Admin Sign In Screen]
    
    SignIn --> AuthSuccess{Authenticated?}
    Register --> AuthSuccess
    
    %% Customer App
    AuthSuccess -->|Customer| Home[Home Screen]
    Home --> Search
    Home --> Cart[Cart Screen]
    Home --> Profile[Profile Screen]
    
    %% Navigation from Search
    Search --> Products[Product Detail]
    Search --> Upload[Prescription Upload]
    
    %% Navigation from Cart
    Cart --> Checkout[Checkout Flow]
    Checkout --> Tracking[Order Tracking]
    
    %% Profile Navigation
    Profile --> Orders[My Orders]
    Profile --> Address[Manage Addresses]
    Profile --> Subscriptions[My Subscriptions]
    Profile --> Prescriptions[Saved Prescriptions]
    Profile --> Payment[Payment Settings]
    Profile --> Notifications[Notifications]
    Profile --> Help[Help & Support]
    
    %% Admin App
    AuthSuccess -->|Admin| AdminDash[Admin Dashboard]
    AdminDash --> Inventory[Admin Inventory]
    Inventory --> AddProduct[Add/Edit Product]
```

## Key Navigation Nodes

| Screen | Primary Access Point | Sub-sections / Actions |
| :--- | :--- | :--- |
| **Home** | Tab Bar (Bottom) | Category browsing, Search entry, Quick access |
| **Search** | Tab Bar / Home Header | Product filtering, Prescription upload FAB |
| **Cart** | Tab Bar | Checkout flow, Quantity management |
| **Profile** | Tab Bar | User settings, Order history, Addresses |
| **Admin Dashboard**| Admin Auth Success | Stats, Inventory management |

## Navigation Logic
- **Authenticated Stacks**: The app switches between `Customer` and `Admin` stacks based on the user's role stored in Firestore.
- **Guest Access**: Users can access the **Search** screen directly from the Welcome screen to browse products before signing in.
- **Failsafe**: All stacks include the `Welcome` screen as a fallback to handle logout transitions gracefully.
