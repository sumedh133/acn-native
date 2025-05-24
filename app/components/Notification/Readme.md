# In-App Notifications Documentation

## 1. Standard DB Structure (for Normal Notifications)

- **`addedTime`** – Timestamp when the notification was added (used to auto-delete after 30 days)
- **`body`** – Message body content to display
- **`cpCode`** – Agent code to whom the notification should be shown
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

### a. Enquiry Sent

- `propertyId` – ID of the property enquired on

### b. Enquiry Received

- `propertyId` – ID of the property
- `name` – Name of the user who enquired
- `nameOfTheProperty` – Name of the property
- `image` – User image

### c. New Feature

- No extra fields required

### d. Going to be De-listed

- `propertyId` – Property to be de-listed
- `days` – Number of days left (3, 2, 1...)
- `cta` – Options: Make Available, Sold

### e. Property De-listed

- `propertyId` – ID of the de-listed property
- `cta` – Options: Call your KAM, Go to Dashboard

### f. Inventory Became Live

- `propertyId` – ID of the property
- `nameOfTheProperty` – Property name
- `cta` – View Details (redirect to property details page)

### g. Status Other Than Live

- `propertyId`
- `nameOfTheProperty`
- `cta` – Call your KAM

### h. Purchased Credits

- `cta` – View Credits

### i. Listing Submit

- `nameOfTheProperty` – Inventory name

### j. Purchased Premium

- `cta` – Properties, Add New Inventories

### k. Requirement Posted

- `requirementId` – ID of the requirement

### l. Free Trial Ended

- `cta` – Get Premium, Compare Plans

### m. Trial Expires in X Days

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

- Triggered on update in `ACN123`
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
