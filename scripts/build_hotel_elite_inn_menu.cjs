const fs = require('fs');
const path = require('path');

const RAW_ITEMS = [
  // 1. HOT & COLD BEVERAGES
  { code: '1', name: 'TEA', price: 25, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Freshly brewed aromatic Indian milk tea with cardamom.' },
  { code: '2', name: 'BLACK TEA', price: 25, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Strong brewed hot black tea with lemon wedge.' },
  { code: '3', name: 'LEMON TEA', price: 30, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Refreshing hot black tea infused with fresh lemon juice.' },
  { code: '4', name: 'GREEN TEA', price: 50, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Healthy antioxidant-rich whole leaf green tea.' },
  { code: '5', name: 'COFFEE', price: 35, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Steaming rich frothy milk coffee.' },
  { code: '6', name: 'BLACK COFFEE', price: 30, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Freshly brewed aromatic black coffee.' },
  { code: '7', name: 'HOT & COLD MILK', price: 40, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Fresh dairy milk served piping hot or chilled.' },
  { code: '8', name: 'CHOICE OF LASSI', price: 60, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Thick creamy Punjabi yogurt lassi (sweet or salted).' },
  { code: '9', name: 'JAL JEERA', price: 40, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Spiced digestive cumin and mint cooler.' },
  { code: '10', name: 'COLD COFFEE', price: 60, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Rich blended iced coffee with milk and cocoa dusting.' },
  { code: '11', name: 'COLD COFFEE WITH ICE CREAM', price: 90, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Thick blended iced coffee topped with a scoop of vanilla ice cream.' },
  { code: '12', name: 'BUTTER MILK', price: 50, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Chilled spiced chaas churned with roasted cumin and coriander.' },
  { code: '13', name: 'PACKAGE DRINKS', price: 20, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Packaged drinking water 1-litre sealed bottle.' },
  { code: '14', name: 'CHOICE OF COLD DRINKS (500 ML)', price: 50, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Chilled 500ml cold drink bottle.' },
  { code: '15', name: 'CHOICE OF COLD DRINKS (200 ML)', price: 25, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Chilled 200ml cold drink glass/bottle.' },
  { code: '16', name: 'CHOICE OF M/S COLD DRINK (200ML)', price: 40, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Special 200ml beverage choice.' },
  { code: '17', name: 'FRESH LIME WATER / SODA', price: 40, cat: 'Beverages', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Fresh squeezed lime juice served with water or sparkling soda (sweet/salt).' },

  // 2. MOCKTAIL COUNTER
  { code: '21', name: 'PINA COLADA', price: 80, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Tropical pineapple juice blended with coconut cream and crushed ice.' },
  { code: '22', name: 'VIRGIN MOJITO', price: 100, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Muddled fresh mint leaves, lime chunks, cane syrup, and sparkling soda.' },
  { code: '23', name: 'VIRGIN COLADA', price: 110, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Creamy coconut cream cooler with fresh pineapple.' },
  { code: '24', name: 'SUPPER COOLER', price: 110, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Signature refreshing fruit spritzer with citrus herbs.' },
  { code: '25', name: 'GREEN RIVER', price: 120, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Kiwi and green apple cooler with fizz.' },
  { code: '26', name: 'BLUE LAGOON', price: 120, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Curacao citrus cordial layered with sprite and lime.' },
  { code: '27', name: 'MANGO DELIGHT', price: 120, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Luscious Alphonso mango nectar refresher.' },
  { code: '28', name: 'ORANGE DELIGHT', price: 120, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Sun-ripened orange citrus cooler.' },
  { code: '29', name: 'FRUITE PUNCH', price: 130, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Exotic blend of tropical fruit juices topped with cream.' },
  { code: '30', name: 'CHOICE OF SHAKE (VANILLA)', price: 130, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Thick creamy vanilla milkshake.' },
  { code: '31', name: 'CHOICE OF SHAKE (STRAWBERRY)', price: 130, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Sweet strawberry thick milkshake.' },
  { code: '32', name: 'CHOICE OF SHAKE (BANANA)', price: 130, cat: 'Mocktails & Shakes', sec: 'BEVERAGE', veg: true, jain: true, special: false, desc: 'Wholesome fresh banana milkshake.' },

  // 3. BREAKFAST
  { code: '41', name: 'SPECIAL MAGGI', price: 100, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: true, desc: 'Hot wok-tossed Maggi noodles with butter, peas, and mild spices.' },
  { code: '42', name: 'IDLY WITH SAMBHAR CHUTNEY', price: 50, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Steamed fluffy rice-lentil cakes served with hot sambhar and coconut chutney.' },
  { code: '43', name: 'SAMBHAR VADA', price: 80, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Crispy fried medu vadas dipped in aromatic piping hot sambhar.' },
  { code: '44', name: 'PLAIN DOSA', price: 80, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Crispy golden fermented crepe served with sambhar and chutney.' },
  { code: '45', name: 'MASALA DOSA', price: 100, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Crispy dosa wrapped around seasoned spiced potato masala.' },
  { code: '46', name: 'CUTTING MASALA DOSA', price: 120, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Sliced crispy dosa stuffed with signature potato bhaji and ghee.' },
  { code: '47', name: 'GINI DOSA', price: 150, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: true, desc: 'Mumbai-style rolled street dosa with spicy schezwan vegetables and melted cheese.' },
  { code: '48', name: 'SCHEZWAN MASALA DOSA', price: 150, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Fiery wok-tossed Schezwan sauce spread over golden dosa with potato filling.' },
  { code: '49', name: 'CHEESE MUSHROOM DOSA', price: 150, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Sauteed mushrooms and molten cheese encased in a crisp crepe.' },
  { code: '50', name: 'MYSORE MASALA DOSA', price: 150, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Classic Mysore red chutney smeared inside crisp dosa with spicy potato mash.' },
  { code: '51', name: 'GHEE PODI MASALA DOSA', price: 150, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: true, desc: 'Roasted gunpowder spice podi and desi ghee sprinkled over masala dosa.' },
  { code: '52', name: 'UPMA', price: 60, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Semolina roasted with mustard seeds, curry leaves, and green chillies.' },
  { code: '53', name: 'UTTAPAM', price: 60, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Soft thick savory South Indian pancake.' },
  { code: '54', name: 'RAWA DOSA', price: 80, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Lacy, crispy semolina crepe spiced with black pepper and cumin.' },
  { code: '55', name: 'RAWA MASALA DOSA', price: 110, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Crispy semolina dosa folded over savory spiced potato masala.' },
  { code: '56', name: 'CORN FLAKE WITH MILK', price: 100, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Crunchy golden corn flakes served with a bowl of hot sweetened milk.' },
  { code: '57', name: 'BREAD TOAST (WITH BUTTER & JAM)', price: 50, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Four slices of golden toasted bread served with butter and fruit jam.' },
  { code: '58', name: 'SPECIAL POHA', price: 90, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: true, desc: 'Flattened rice tempered with mustard, roasted peanuts, onions, and turmeric.' },
  { code: '59', name: 'POORI BHAJI', price: 120, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Puffed golden whole wheat pooris served with spiced aloo bhaji.' },
  { code: '60', name: 'CHHOLEY BHATURE', price: 140, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: true, desc: 'Fluffy golden bhaturas paired with authentic Punjabi spiced chickpea curry.' },
  { code: '61', name: 'ALOO PARATHA WITH CURD', price: 100, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Tawa griddled flatbread stuffed with spiced potato mash, served with curd.' },
  { code: '62', name: 'GOBHI PARATHA WITH CURD', price: 110, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Flaky paratha packed with grated cauliflower and spices, served with curd.' },
  { code: '63', name: 'PANEER PARATHA WITH CURD', price: 150, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Rich flatbread stuffed with seasoned cottage cheese, served with curd.' },
  { code: '64', name: 'VEG SANDWICH', price: 80, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Fresh bread sandwich with sliced cucumbers, tomatoes, and mint chutney.' },
  { code: '65', name: 'VEG GRILLED SANDWICH', price: 100, cat: 'Breakfast', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Toasted panini grilled vegetable sandwich with herbs and butter.' },
  { code: '66', name: 'OMELETTE (P/M)', price: 100, cat: 'Breakfast', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Farm-fresh two-egg omelette (Plain or Masala with onions and chillies).' },
  { code: '67', name: 'BREAD OMELETTE', price: 110, cat: 'Breakfast', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Classic double egg omelette wrapped around toasted bread slices.' },
  { code: '68', name: 'BOILED EGG', price: 80, cat: 'Breakfast', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Two farm eggs hard-boiled and sprinkled with rock salt and pepper.' },
  { code: '69', name: 'FRENCH TOAST', price: 110, cat: 'Breakfast', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Golden egg-battered bread pan-seared with butter.' },
  { code: '70', name: 'CHICKEN SANDWICH', price: 200, cat: 'Breakfast', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Shredded chicken tossed with creamy mayo and pepper in grilled bread.' },

  // 4. FRESH GREEN SALAD'S & CURD
  { code: '81', name: 'GREEN SALAD', price: 90, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Fresh garden slices of cucumber, carrot, tomato, and lemon wedges.' },
  { code: '82', name: 'ONION SALAD', price: 60, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Thinly sliced crunchy red onion rings sprinkled with chaat masala.' },
  { code: '83', name: 'KACHUMBAR SALAD', price: 90, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Diced cucumbers, tomatoes, and onions tossed with lime and coriander.' },
  { code: '84', name: 'SPROUTED SALAD', price: 110, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Nutritious sprouted moong and gram tossed with lemon and mild spices.' },
  { code: '85', name: 'ALOO CHANA CHAT', price: 100, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Tangy street-style boiled potato and kabuli chana chaat.' },
  { code: '86', name: 'GREEN PEAS CHAT', price: 90, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Tender steamed green peas sauteed with tangy chaat seasonings.' },
  { code: '87', name: 'PAPAD (DRY/FRY)', price: 25, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Crispy roasted or deep-fried urad dal papad.' },
  { code: '88', name: 'MASALA PAPAD', price: 40, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Crisp roasted papad topped with spicy onion-tomato kachumber.' },
  { code: '89', name: 'PLAIN CURD', price: 40, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Fresh creamy set dairy curd.' },
  { code: '90', name: 'VEG RAITA', price: 70, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Chilled whisked yogurt with finely diced cucumber and roasted cumin.' },
  { code: '91', name: 'BOONDI RAITA', price: 70, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Crisp gram flour boondi soaked in seasoned chilled yogurt.' },
  { code: '92', name: 'PINEAPPLE RAITA', price: 110, cat: 'Salads & Raita', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Sweet and tangy chilled yogurt infused with juicy pineapple chunks.' },

  // 5. FROM THE SOUP KETTLE
  { code: '101', name: 'VEG HOT & SOUR SOUP', price: 100, cat: 'Soups & Shorba', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Fiery and tangy Indo-Chinese vegetable broth.' },
  { code: '102', name: 'VEG MANCHOW SOUP', price: 110, cat: 'Soups & Shorba', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Thick dark soy garlic soup loaded with vegetables and fried crispy noodles.' },
  { code: '103', name: 'VEG SWEET CORN SOUP', price: 110, cat: 'Soups & Shorba', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Silky mild sweet corn broth with tender kernels.' },
  { code: '104', name: 'VEG LEMON CORIENDER SOUP', price: 110, cat: 'Soups & Shorba', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Clear refreshing vegetable soup accented with fresh lemon and coriander.' },
  { code: '105', name: 'TOMATO SOUP', price: 120, cat: 'Soups & Shorba', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Velvety ripe tomato soup served with crispy golden croutons.' },
  { code: '106', name: 'TOMATO DHANIYA KA SHORBA', price: 150, cat: 'Soups & Shorba', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Traditional slow-simmered Indian spiced tomato and fresh coriander broth.' },
  { code: '107', name: 'CHICKEN HOT & SOUR SOUP', price: 130, cat: 'Soups & Shorba', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Spicy pepper and vinegar chicken soup with egg ribbons.' },
  { code: '108', name: 'CHICKEN MANCHOW SOUP', price: 130, cat: 'Soups & Shorba', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Hearty chicken garlic soup topped with crunchy fried noodles.' },
  { code: '109', name: 'CHICKEN SWEET CORN SOUP', price: 130, cat: 'Soups & Shorba', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Gentle creamy broth with shredded chicken and sweet corn.' },
  { code: '110', name: 'CHICKEN LEMON CORIENDER SOUP', price: 130, cat: 'Soups & Shorba', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Zesty chicken broth flavored with fresh lemon juice and green coriander.' },
  { code: '111', name: 'CHICKEN SHORBA', price: 180, cat: 'Soups & Shorba', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Rich royal Awadhi chicken extract simmered with whole spices.' },

  // 6. FROM THE VEG STARTER
  { code: '121', name: 'HARA BHARA KEBAB', price: 200, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Pan-seared spinach, green pea and potato patties spiced with garam masala.' },
  { code: '122', name: 'ADRAKI TIKKI', price: 200, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Ginger-infused crisp vegetable tikkis served with mint dip.' },
  { code: '123', name: 'VEG CORN KEBAB', price: 200, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Golden sweet corn and vegetable mince skewers.' },
  { code: '124', name: 'VEG SEEKH KEBAB', price: 250, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Minced mixed vegetables seasoned with herbs and roasted on tandoor skewers.' },
  { code: '125', name: 'VEG CUTLET', price: 150, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Crumb-fried crispy vegetable cutlets with tomato dip.' },
  { code: '126', name: 'VEG PAKODA', price: 150, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Assorted seasonal vegetables dipped in spiced gram flour batter and fried.' },
  { code: '127', name: 'VEG KULHAD KEBAB', price: 220, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Smoky clay-pot roasted vegetable kebabs served with chutney.' },
  { code: '128', name: 'DAHI KEBAB', price: 250, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Melt-in-mouth hung curd patties with a golden crispy crust.' },
  { code: '129', name: 'PANEER PAKODA', price: 200, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Batter-fried succulent cottage cheese slices with chaat masala.' },
  { code: '130', name: 'PANEER KURKURE ROLL', price: 220, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Crispy coated paneer fingers rolled in crushed spiced flakes.' },
  { code: '131', name: 'CHANA ROAST', price: 150, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Pan-roasted spicy kabuli chana tossed with curry leaves and onions.' },
  { code: '132', name: 'MUSHROOM PAKODA', price: 180, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Whole fresh mushrooms batter-fried to golden crispness.' },
  { code: '133', name: 'FINGER CHIPS', price: 120, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Crispy salted potato French fries.' },
  { code: '134', name: 'PANEER TIKKA', price: 250, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Charcoal-grilled cottage cheese cubes marinated in yogurt and tandoori spices.' },
  { code: '135', name: 'PANEER PUDINA TIKKA', price: 250, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Tandoor-roasted paneer cubes infused with fresh mint and coriander.' },
  { code: '136', name: 'PANEER LEHSUNI TIKKA', price: 250, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Creamy paneer cubes marinated in robust roasted garlic marinade.' },
  { code: '137', name: 'PANEER HARIYALI TIKKA', price: 250, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Vibrant green herb marinade coated paneer grilled in clay oven.' },
  { code: '138', name: 'PANEER METHI SEEKH KEBAB', price: 310, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Grated paneer and fresh fenugreek leaves molded onto skewers and char-grilled.' },
  { code: '139', name: 'PANEER SOTI BOTI', price: 220, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Tender bite-sized spiced paneer morsels tossed on a hot griddle.' },
  { code: '140', name: 'CHEESE CORN BOWL', price: 250, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Baked sweet corn kernels enveloped in melted golden cheese.' },
  { code: '141', name: 'SAAHI PEDRO', price: 220, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Chef specialty paneer and potato delicacy.' },
  { code: '142', name: 'AMRITSARI SOYA TIKKA', price: 220, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Protein-rich soya chaap marinated in authentic Amritsari spices and grilled.' },
  { code: '143', name: 'TANDOORI PLATTER(VEG)', price: 650, cat: 'Veg Starters', sec: 'FOOD', veg: true, jain: false, special: true, desc: 'Grand platter with Paneer Tikka, Veg Seekh, Hara Bhara Kebab, and Mushroom.' },

  // 7. FROM THE NONVEG STARTERS
  { code: '151', name: 'EGG POUCH', price: 90, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Delicately poached farm eggs with black pepper.' },
  { code: '152', name: 'EGG PAKODA', price: 110, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Boiled egg halves dipped in spiced batter and deep-fried.' },
  { code: '153', name: 'CHICKEN PAKODA', price: 220, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Crispy fried boneless chicken fritters with mint chutney.' },
  { code: '154', name: 'CHICKEN AMRITSARI(FRY)', price: 250, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Ajwain and gram flour batter-fried Punjabi style chicken.' },
  { code: '155', name: 'CHICKEN TIKKA', price: 300, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Boneless chicken chunks marinated in mustard oil and red spices, char-grilled.' },
  { code: '156', name: 'CHICKEN BANJARA TIKKA', price: 300, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Rustic nomad-style chicken tikka with pounded coriander and chillies.' },
  { code: '157', name: 'CHICKEN MALAI TIKKA', price: 350, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Velvety chicken chunks coated in cashew cream, cheese, and cardamom.' },
  { code: '158', name: 'CHICKEN AFGHANI TIKKA', price: 350, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Mildly spiced, creamy roasted chicken morsels.' },
  { code: '159', name: 'CHICKEN HARIYALI TIKKA', price: 300, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Clay oven cooked chicken in a fresh coriander, mint, and spinach marinade.' },
  { code: '160', name: 'CHICKEN GARLIC TIKKA', price: 300, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Tender chicken marinated in roasted garlic paste and grilled.' },
  { code: '161', name: 'CHICKEN DOUBLE TADKA TIKKA', price: 350, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Smoky chicken tikka finished with a sizzling double ghee-garlic tempering.' },
  { code: '162', name: 'CHEF SPECIAL CHICKEN TIKKA', price: 350, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Hotel Elite Inn secret recipe char-grilled tender chicken.' },
  { code: '163', name: 'CHICKEN RESHMI KEBAB', price: 300, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Silky chicken mince kebabs seasoned with roasted herbs.' },
  { code: '164', name: 'CHICKEN TANGDI KEBAB', price: 300, cat: 'Non-Veg Starters', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Spiced chicken drumsticks grilled to smoky perfection in tandoor.' },

  // 8. CHICKEN CURRIES & MAIN COURSE
  { code: '171', name: 'CHICKEN MASALA', price: 280, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Traditional homestyle chicken cooked in rich onion-tomato gravy.' },
  { code: '172', name: 'CHICKEN KADAI', price: 280, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Chicken tossed with bell peppers and crushed coriander seeds in a wok.' },
  { code: '173', name: 'CHICKEN HYDERABADI', price: 290, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Aromatic chicken curry enriched with fresh mint and coriander paste.' },
  { code: '174', name: 'CHICKEN RARA', price: 320, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Chicken pieces simmered together with rich spiced chicken mince keema gravy.' },
  { code: '175', name: 'CHICKEN BHUNA', price: 290, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Dry-roasted chicken simmered slowly until thick caramelized gravy coats each piece.' },
  { code: '176', name: 'CHICKEN MAHARAJA', price: 350, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Royal Mughlai chicken preparation with cashew nut paste and saffron.' },
  { code: '177', name: 'CHICKEN ASIYANA', price: 290, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'House specialty mildly spiced chicken curry.' },
  { code: '178', name: 'CHICKEN ROGAN JOSH', price: 290, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Kashmiri style slow-cooked aromatic chicken in rich red gravy.' },
  { code: '179', name: 'CHICKEN BHARTA', price: 320, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Finely shredded boneless chicken in a creamy, egg-enriched sauce.' },
  { code: '180', name: 'CHICKEN BUTTER MASALA', price: 320, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Classic chicken in a velvety butter-tomato makhani gravy.' },
  { code: '181', name: 'CHICKEN TIKKA MASALA', price: 350, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Tandoor-charred chicken tikka cubes simmered in spiced tomato gravy.' },
  { code: '182', name: 'BUTTER CHICKEN BONELESS', price: 350, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Tender boneless chicken in luscious sweet-tangy makhani butter cream.' },
  { code: '183', name: 'MURG MUSSALLAM (HALF)', price: 350, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Slow-cooked spiced half chicken in a royal egg-garnished Mughlai gravy.' },
  { code: '184', name: 'MURG MUSSALLAM (FULL)', price: 650, cat: 'Chicken Specialities', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Magnificent whole chicken simmered in rich saffron-cashew Mughlai gravy.' },

  // 9. SEAFOOD & MUTTON DELICACIES
  { code: '191', name: 'FISH CURRY (B/L)', price: 270, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Boneless fish fillets cooked in homestyle mustard and tomato curry.' },
  { code: '192', name: 'FISH MASALA (B/L)', price: 270, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Pan-seared boneless fish in thick onion-tomato gravy.' },
  { code: '193', name: 'FISH AMRITSARI CURRY', price: 270, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Crisp battered fish simmered in tangy Punjabi style gravy.' },
  { code: '194', name: 'FISH CURRY BENGALI STYLE', price: 270, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Authentic Macher Jhol cooked with panch phoron and mustard oil.' },
  { code: '195', name: 'FISH TIKKA MASALA', price: 300, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Charcoal-grilled fish tikka tossed in spicy masala gravy.' },
  { code: '196', name: 'PRAWNS CURRY', price: 350, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Fresh prawns simmered in coastal coconut and spice gravy.' },
  { code: '197', name: 'PRAWNS MASALA', price: 350, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Juicy prawns sauteed with onions, capsicum, and garam masala.' },
  { code: '198', name: 'PRAWNS CURRY IN BENGALI STYLE', price: 370, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Traditional Bengali Chingri Malai Curry preparation.' },
  { code: '199', name: 'TANDOORI PRAWNS MASALA', price: 370, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Clay oven charred prawns finished in a smoky masala sauce.' },
  { code: '200', name: 'MUTTON CURRY', price: 380, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Tender baby goat meat slow-cooked in traditional Odisha homestyle gravy.' },
  { code: '201', name: 'MUTTON MASALA', price: 380, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Mutton pieces braised in a robust, aromatic onion-tomato reduction.' },
  { code: '202', name: 'BHUNA MUTTON', price: 380, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Slow pan-roasted mutton until dark, caramelized, and intensely flavorful.' },
  { code: '203', name: 'MUTTON ROGAN JOSH', price: 380, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Classic Kashmiri goat curry cooked with ratan jot and Kashmiri chillies.' },
  { code: '204', name: 'MUTTON RARA', price: 450, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Mutton bone-in chunks cooked along with rich spiced mutton keema.' },
  { code: '205', name: 'CHAMPARAN MEAT', price: 500, cat: 'Seafood & Mutton', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Celebrated Ahuna earthen handi slow-cooked mutton with whole garlic pods.' },

  // 10. FROM THE INDIAN BREADS
  { code: '211', name: 'RUMALI ROTI', price: 40, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Handkerchief-thin soft unleavened bread tossed over an inverted wok.' },
  { code: '212', name: 'TAWA ROTI', price: 25, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Fresh whole wheat flatbread made on tawa.' },
  { code: '213', name: 'BUTTER TAWA ROTI', price: 25, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Tawa roti basted with pure dairy butter.' },
  { code: '214', name: 'TANDOORI ROTI', price: 30, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Whole wheat bread baked in clay tandoor.' },
  { code: '215', name: 'BUTTER TANDOORI ROTI', price: 35, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Clay oven roti brushed with golden melted butter.' },
  { code: '216', name: 'MISSI ROTI', price: 40, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Nutritious gram flour and wheat flatbread spiced with ajwain and kasuri methi.' },
  { code: '217', name: 'PLAIN PARATHA TAWA', price: 40, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Layered whole wheat paratha roasted crisp on tawa.' },
  { code: '218', name: 'LACHHA PARATHA', price: 40, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Multi-layered flaky tandoor paratha brushed with butter.' },
  { code: '219', name: 'PLAIN NAAN', price: 40, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Traditional tear-drop shaped leavened white flour bread from clay oven.' },
  { code: '220', name: 'BUTTER NAAN', price: 45, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Soft tandoori naan lavishly brushed with melted butter.' },
  { code: '221', name: 'GARLIC NAAN', price: 55, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Tandoor naan topped with minced roasted garlic, coriander, and butter.' },
  { code: '222', name: 'MASALA KULCHA', price: 55, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Leavened bread stuffed with spiced potato and onion mash.' },
  { code: '223', name: 'PANEER KULCHA', price: 70, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Stuffed kulcha filled with seasoned grated cottage cheese.' },
  { code: '224', name: 'ROTI BASKET', price: 350, cat: 'Indian Breads', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Assorted basket with Butter Naan, Garlic Naan, Lachha Paratha, Tandoori Roti & Missi Roti.' },

  // 11. BASMATI KE JADOO (Rice & Biryani)
  { code: '231', name: 'PLAIN RICE (BASMATI)', price: 100, cat: 'Rice & Biryani', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Steamed long-grain aromatic Royal Basmati rice.' },
  { code: '232', name: 'JEERA RICE', price: 120, cat: 'Rice & Biryani', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Basmati rice tempered with roasted cumin seeds and desi ghee.' },
  { code: '233', name: 'VEG BIRYANI', price: 210, cat: 'Rice & Biryani', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Layered basmati rice with seasonal vegetables, mint, and saffron.' },
  { code: '234', name: 'VEG PULAO', price: 210, cat: 'Rice & Biryani', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Fragrant basmati rice gently cooked with green peas, carrots, and whole spices.' },
  { code: '235', name: 'CURD RICE', price: 150, cat: 'Rice & Biryani', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Comforting tempered curd rice with mustard seeds, curry leaves, and ginger.' },
  { code: '236', name: 'LEMON RICE', price: 150, cat: 'Rice & Biryani', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Tangy South Indian rice tempered with turmeric, peanuts, and fresh lemon juice.' },
  { code: '237', name: 'PANEER BIRYANI', price: 250, cat: 'Rice & Biryani', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Layered dum biryani with marinated paneer cubes and caramelized onions.' },
  { code: '238', name: 'PANEER TIKKA BIRYANI', price: 280, cat: 'Rice & Biryani', sec: 'FOOD', veg: true, jain: false, special: true, desc: 'Smoky tandoori paneer tikka layered in aromatic spiced saffron rice.' },
  { code: '239', name: 'EGG BIRYANI', price: 180, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Fragrant basmati rice layered with spiced boiled eggs and biryani masala.' },
  { code: '240', name: 'CHICKEN DUM BIRYANI', price: 250, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Authentic slow-dum cooked basmati rice with tender marinated chicken pieces.' },
  { code: '241', name: 'CHICKEN HYDERABADI BIRYANI', price: 270, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Spicy Hyderabadi kacchi style chicken biryani with mint and saffron.' },
  { code: '242', name: 'CHICKEN ROAST BIRYANI', price: 290, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Basmati biryani topped with crispy pan-roasted spicy chicken.' },
  { code: '243', name: 'CHICKEN TIKKA BIRYANI', price: 300, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Charcoal grilled chicken tikka cubes layered with fragrant biryani rice.' },
  { code: '244', name: 'CHICKEN HANDI BIRYANI', price: 350, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Sealed clay handi dum biryani with rich chicken masala.' },
  { code: '245', name: 'PRAWNS BIRYANI', price: 280, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Coastal spiced succulent prawns layered with long-grain basmati.' },
  { code: '246', name: 'MUTTON BIRYANI', price: 350, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Royal mutton biryani with succulent baby goat meat and saffron essence.' },
  { code: '247', name: 'MUTTON HANDI BIRYANI', price: 400, cat: 'Rice & Biryani', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Clay handi slow-cooked tender mutton biryani served with raita.' },

  // 12. CONTINENTAL & SIZZLERS
  { code: '251', name: 'WHITE SAUCE PASTA VEG', price: 200, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Penne pasta tossed in rich creamy Bechamel cheese sauce with bell peppers.' },
  { code: '252', name: 'RED SAUCE PASTA VEG', price: 200, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Penne pasta simmered in tangy herb tomato Arrabiata sauce.' },
  { code: '253', name: 'FUSELI PASTA', price: 210, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Spiral fusilli pasta tossed with garlic, olive oil, and herbs.' },
  { code: '254', name: 'MIX SAUCE PASTA', price: 220, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Pink sauce pasta combining rich cream and tangy tomato herbs.' },
  { code: '255', name: 'WHITE SAUCE CHICKEN PASTA', price: 280, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Creamy white sauce pasta with tender chicken breast strips.' },
  { code: '256', name: 'RED SAUCE CHICKEN PASTA', price: 280, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Spicy chicken penne tossed in robust tomato basil sauce.' },
  { code: '257', name: 'MIX SAUCE CHICKEN PASTA', price: 300, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Pink sauce pasta loaded with grilled chicken and cheese.' },
  { code: '258', name: 'CHICKEN BARBECUE', price: 250, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: false, jain: false, special: false, desc: 'Grilled chicken glazed with smoky sweet barbecue sauce.' },
  { code: '259', name: 'VEG MIX GRILLED SIZZLER', price: 200, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: true, jain: false, special: false, desc: 'Sizzling hot plate with grilled vegetables, french fries, and barbecue sauce.' },
  { code: '260', name: 'MIX VEG TANDOORI SIZZLER', price: 350, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: true, jain: false, special: true, desc: 'Sizzling tandoori paneer, kebabs, and butter rice with pepper sauce.' },
  { code: '261', name: 'CHICKEN TIKKA SIZZLER', price: 400, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Sizzling chicken tikka served with buttered rice and crispy fries.' },
  { code: '262', name: 'MIX CHICKEN SIZZLER', price: 400, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Platter of assorted grilled chicken skewers on a piping hot sizzler plate.' },
  { code: '263', name: 'MIX NON VEG SIZZLER', price: 550, cat: 'Continental & Sizzlers', sec: 'FOOD', veg: false, jain: false, special: true, desc: 'Grand sizzler with chicken, mutton, prawns, and grilled accompaniments.' },

  // 13. SWEET MEMORIES (Desserts)
  { code: '271', name: 'FRESH FRUITE PLATTER', price: 200, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Chef selection of fresh sliced seasonal fruits.' },
  { code: '272', name: 'HOT GULAB JAMUN', price: 110, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Two hot melt-in-mouth milk mawa dumplings soaked in cardamom sugar syrup.' },
  { code: '273', name: 'RICE KHEER', price: 90, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Traditional slow-cooked basmati rice pudding infused with saffron and nuts.' },
  { code: '274', name: 'GAJAR HALWA (SEASONAL)', price: 120, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Slow-cooked grated red carrots with pure ghee, mawa, and cashews.' },
  { code: '275', name: 'HOT GULAB JAMUN WITH ICE-CREAM', price: 150, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Piping hot gulab jamun paired with a scoop of chilled vanilla ice cream.' },
  { code: '276', name: 'VANILLA ICE-CREAM', price: 80, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Classic double scoop vanilla dairy ice cream.' },
  { code: '277', name: 'VANILLA ICE-CREAM WITH HOT CHOCOLATE SAUCE', price: 150, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: true, desc: 'Vanilla ice cream drenched in warm decadent chocolate sauce.' },
  { code: '278', name: 'STRAWBERRY ICE-CREAM', price: 80, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Sweet strawberry dairy ice cream.' },
  { code: '279', name: 'PLAIN PISTA', price: 80, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Traditional pistachio flavored ice cream.' },
  { code: '280', name: 'KESAR PISTA', price: 100, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Royal saffron and roasted pistachio rich ice cream.' },
  { code: '281', name: 'BUTTER SCOTCH', price: 110, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Creamy butterscotch ice cream with crunchy praline bits.' },
  { code: '282', name: 'CHOCOLATE ICE-CREAM', price: 110, cat: 'Desserts', sec: 'FOOD', veg: true, jain: true, special: false, desc: 'Rich Dutch chocolate ice cream scoop.' }
];

console.log('Total items in catalogue:', RAW_ITEMS.length);

// Generate formatted RESTAURANT_MENU JS array
const menuObjects = RAW_ITEMS.map(item => {
  const dineIn = item.price;
  const roomService = Math.round(item.price * 1.10);
  const swiggy = Math.round(item.price * 1.25);
  const bar = Math.round(item.price * 1.05);

  return `  {
    id: "m-${item.code}",
    itemCode: "${item.code}",
    name: ${JSON.stringify(item.name)},
    category: ${JSON.stringify(item.cat)},
    section: ${JSON.stringify(item.sec)},
    price: ${item.price},
    dineInPrice: ${dineIn},
    roomServicePrice: ${roomService},
    swiggyPrice: ${swiggy},
    barPrice: ${bar},
    isVeg: ${item.veg},
    isJain: ${item.jain},
    isSpecial: ${item.special},
    description: ${JSON.stringify(item.desc)}
  }`;
});

const menuExportCode = `// Multi-Outlet F&B Menu with Fast Item Codes (Hotel Elite Inn Restaurant, Bar, Room Service, Swiggy)
// Authentic Official Menu (204 Items) Directly from Hotel Elite Inn Menu Card
export const RESTAURANT_MENU = [
${menuObjects.join(',\n')}
];`;

// Generate D1 SQL Migration
const sqlStatements = [
  `-- ============================================================================`,
  `-- HOTEL ELITE INN - MIGRATION 0045`,
  `-- AUTHENTIC HOTEL ELITE INN RESTAURANT MENU (204 OFFICIAL ITEMS)`,
  `-- ============================================================================`,
  ``,
  `DELETE FROM menu_items;`,
  ``
];

RAW_ITEMS.forEach(item => {
  const escapedName = item.name.replace(/'/g, "''");
  const escapedCategory = item.cat.replace(/'/g, "''");
  const escapedDesc = item.desc.replace(/'/g, "''");
  const isVeg = item.veg ? 1 : 0;
  const isJain = item.jain ? 1 : 0;
  const isSpecial = item.special ? 1 : 0;

  sqlStatements.push(
    `INSERT OR REPLACE INTO menu_items (item_id, item_code, name, category, price, is_veg, is_jain, is_special, description, is_available) ` +
    `VALUES ('MENU-${item.code}', '${item.code}', '${escapedName}', '${escapedCategory}', ${item.price.toFixed(2)}, ${isVeg}, ${isJain}, ${isSpecial}, '${escapedDesc}', 1);`
  );
});

const migrationSql = sqlStatements.join('\n') + '\n';

// Write migration SQL file
const migrationPath = path.join(__dirname, '..', 'migrations', '0045_sync_hotel_elite_inn_menu.sql');
fs.writeFileSync(migrationPath, migrationSql, 'utf8');
console.log('Generated D1 migration:', migrationPath);

// Patch src/data/hotelData.js
const hotelDataPath = path.join(__dirname, '..', 'src', 'data', 'hotelData.js');
let hotelDataContent = fs.readFileSync(hotelDataPath, 'utf8');

const startMarker = '// Multi-Outlet F&B Menu with Fast Item Codes';
const endMarker = '// Authentic GST FOM Register Dataset (Front Office Management Report 25/09/2026)';

const startIndex = hotelDataContent.indexOf(startMarker);
const endIndex = hotelDataContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('ERROR: Could not locate start or end marker in hotelData.js');
  process.exit(1);
}

const newHotelData = hotelDataContent.slice(0, startIndex) + menuExportCode + '\n\n' + hotelDataContent.slice(endIndex);
fs.writeFileSync(hotelDataPath, newHotelData, 'utf8');
console.log('Successfully updated RESTAURANT_MENU in src/data/hotelData.js');
