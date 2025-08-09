<footer
	class="mt-12 flex w-full flex-col items-center justify-center gap-4 bg-[var(--primary-background)] p-2 md:p-6 md:pt-6"
>
	<div
		class="flex w-[90%] flex-col items-center justify-center gap-2 border-b border-b-[#6d6d6d] md:w-[85%] md:gap-6"
	>
		<div
			class="flex min-w-[300px] flex-col items-center justify-center gap-4 p-2 md:min-w-[900px] md:flex-row md:items-start md:justify-between md:p-12"
		>
			<div class="item">
				<span class="icon-[material-symbols-light--delivery-truck-speed-outline-rounded] h-15 w-15"
				></span>
				<h1 class="text-center text-lg font-semibold">Fast delivery or pickup.</h1>
				<p class="text-center text-sm">
					Enjoy fast two-hour delivery, free shipping, or convenient in-store pickup options.
				</p>
			</div>

			<div class="item">
				<span class="icon-[ph--key-return-light] h-15 w-15"></span>
				<h1 class="text-center text-lg font-semibold">Free and easy returns.</h1>
				<p class="text-center text-sm">
					Easily return items online or visit us for quick and friendly assistance.
				</p>
			</div>

			<div class="item">
				<span class="icon-[icons8--bank-card] h-15 w-15"></span>

				<h1 class="text-center text-lg font-semibold">Shop with Card.</h1>
				<p class="text-center text-sm">
					Receive 3% cashback on all purchases when you use any bank card.
				</p>
			</div>
		</div>

		<div class="flex flex-col gap-6 text-justify text-xs text-[#6d6d6d]">
			<span>
				Trade-in values depend on the condition, model, and specifications of your device. Not all
				devices qualify for credit, and you must be of legal age to participate. The trade-in value
				can be applied directly to your new purchase or converted into store credit. Actual value
				awarded is based on the receipt of a qualifying device that matches the provided
				description. Sales tax may apply to the total value of your new purchase.
			</span>
			<span>
				Trade in your old device and enjoy enhanced trade-in credits when you exchange an eligible
				device for a new product through August 31, 2025. Terms and conditions apply.
			</span>

			<span>
				In-store trade-ins require a valid photo ID, and local regulations may require us to retain
				this information. Offers may vary by location and between in-store and online transactions.
				We reserve the right to refuse or limit any trade-in transaction for any reason. For more
				details, please consult our trade-in partner regarding eligible devices and recycling
				options. Restrictions may apply.
			</span>

			<span>
				Our cutting-edge products are designed to keep you connected and inspired. Some features may
				require a subscription and may not be available in all regions. Join us on this journey of
				technological advancement. Features and services are subject to change, ensuring you always
				have access to the latest innovations.
			</span>
			<span> </span>
		</div>
	</div>
	<div class="flex w-[90%] items-center justify-between md:w-[85%] mb-2 md:mb-0">
		<p class="text-center text-xs">
			Copyright &copy; 2025 Meta electronics. <span class="hidden md:inline">All rights reserved.</span>
		</p>

		<div class="social-media flex items-center gap-2 sm:gap-4 md:gap-6">
			<span class="icon-[ri--twitter-x-line] h-4 w-4 md:h-5 md:w-5"></span>
			<span class="icon-[uim--facebook-f] h-4 w-4 md:h-5 md:w-5"></span> 
			<span class="icon-[fa--instagram] h-4 w-4 md:h-5 md:w-5"></span>
		</div>
	</div>
</footer>

<style>
	h1,
	p {
		color: #6d6d6d;
	}

	.item {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: center;
		justify-content: flex-start;
		width: 210px;
	}
	.social-media span {
		transition: all 0.2s;
	}
	.social-media span:hover {
		color: var(--accent);
	}
</style>
