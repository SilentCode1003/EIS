truncate table cabling_equipment;
truncate table cabling_item_master;
truncate table deploy_it_equipment;
truncate table it_equipment_tracker;
truncate table master_item;
truncate table pullout_it_equipment;
truncate table purchase_details;
truncate table purchase_item;
truncate table purchase_order_details;
truncate table purchase_order_item;
truncate table register_it_equipment;
truncate table request_budget_details;
truncate table request_cabling_details;
truncate table request_cabling_equipment;
truncate table request_cabling_stocks_details;
truncate table request_cabling_stocks_equipments;
truncate table tracker_system_logs;
truncate table transaction_cabling_equipment;
truncate table transaction_cabling_stocks_details;
truncate table transaction_cabling_stocks_equipments;
truncate table transaction_it_equipment;
truncate table transaction_purchase_item;
truncate table transaction_request_budget;
truncate table master_item;
truncate table transaction_transfer_it_details;
truncate table transaction_transfer_it_equipment;
truncate table request_sapre_details;
truncate table request_spare_items;
truncate table return_request_it_equipments;
truncate table master_item_price;
ALTER TABLE master_item AUTO_INCREMENT=1001;
ALTER TABLE request_sapre_details AUTO_INCREMENT=1000;
ALTER TABLE master_warehouse AUTO_INCREMENT=1000;
ALTER TABLE master_item_price AUTO_INCREMENT=1000;