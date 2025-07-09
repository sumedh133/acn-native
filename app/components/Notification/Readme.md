# In-App Notifications Documentation

## 1. Standard DB Structure (for Normal Notifications)

- **`addedTime`** – Timestamp when the notification was added (used to auto-delete after 30 days)
- **`body`** – Message body content to display
- **`cpId`** – Agent code to whom the notification should be shown
- **`cta`** – CTAs to be displayed (can also be dynamically set from slug + functionality)
- **`image`** – Image to show (options: user image or ACN logo)
- **`title`** – Title to be displayed on top
- **`type`** – Defines the type of UI and corresponding functionality

## 2. UI Types Required

a. **UI Variants:**

i. Enquiry Sent  
ii. Enquiry Received  
iii. New Feature  
iv. Going to be De-listed  
v. De-listed  
vi. Inventory Became Live  
vii. Purchased Credits  
viii. Status (Other than Live)  
ix. Listing Submit  
x. Premium Purchased  
xi. Requirement Submitted

## 3. Database Fields per Notification Type

### a. Enquiry Sent -> `enquiry_buyer_notification`

- `propertyId` – ID of the property enquired on
- `propertyName` - Name of the property enquired on

### b. Enquiry Received -> `enquiry_seller_notification`

- `propertyId` – ID of the property
- `name` – Name of the user who enquired
- `propertyName` – Name of the property
- `image` – User image

### c. New Feature

- No extra fields required

### d. Going to be De-listed -> `delisting_notification`

- `propertyId` – Property to be de-listed
- `days` – Number of days left (3, 2, 1...)
- `cta` – Options: Make Available, Sold

### e. Property De-listed -> `delistied_notification`

- `propertyId` – ID of the de-listed property
- `cta` – Options: Call your KAM, Go to Dashboard

### f. Inventory Became Live -> `listing_live_notification`

- `propertyId` – ID of the property
- `propertyName` – Property name
- `cta` – View Details (redirect to property details page)

### g. Status Other Than Live -> `qc_notification`

- `propertyId`
- `propertyName`
- `cta` – Call your KAM

### h. Purchased Credits -> `payment_notification`

- `cta` – View Credits

### i. Listing Submit -> `add_inventory_notification`

- `propertyName` – Inventory name

### j. Purchased Premium -> `payment_notification`

- `cta` – Properties, Add New Inventories

### k. Requirement Posted -> `add_requirement_notification`

- `requirementId` – ID of the requirement

### l. Free Trial Ended -> `trial_ended_notification`

- `cta` – Get Premium, Compare Plans

### m. Trial Expires in X Days -> `trial_notification`

- `cta` – Properties, Add New Inventories

## 4. Data Source Triggers

### a. Enquiry Sent

- Triggered via **Enquiry Submit** button
- _Best Practice:_ Notification Server

### b. Enquiry Received

- Same as above (Enquiry Submit)
- _Best Practice:_ Notification Server

### c. New Feature

- Triggered by Notification Server

### d. Going to be De-listed

- Triggered via Cloud Function handling property de-list schedule

### e. Property De-listed

- Triggered similarly via Cloud Function

### f. Inventory Became Live

- Triggered on update in `acnProperties`
- _Best Practice:_ Cloud Function (to be integrated with QC Dashboard flow)

### g. Status Other Than Live

- Triggered via QC Dashboard or Cloud Function by Data Team

### h. Purchased Credits

- Triggered from Billing Page or when `agents` DB is updated with a Transaction ID

### i. Listing Submit

- Triggered via QC data update or inventory submit function

### j. Purchased Premium

- Triggered via Billing Page or `agents` DB update with Transaction ID

### k. Requirement Posted

- Triggered on Requirements Page update

### l. Free Trial Ended

- Triggered by Free Trial End Function (changes user status from Free Trial to Basic)

### m. Trial Expiry (X Days Left)

- Triggered via new Cloud Function to notify users
