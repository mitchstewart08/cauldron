Cauldron = LibStub("AceAddon-3.0"):NewAddon("Cauldron", "AceConsole-3.0")

function Cauldron:OnInitialize()
  Cauldron:RegisterChatCommand('nwc', 'HandleChatCommand');
end

function Cauldron:GetTradeSkills()
    local professionName, rank, maxRank = GetCraftDisplaySkillLine();
    local tsName, tsRank, tsMaxRank = GetTradeSkillLine();
    local exported = false;
    local skills = {};
    local totalCrafts = GetNumCrafts();
    local totalSkills = GetNumTradeSkills();
    local isCraft = totalCrafts > 0;
    for i = 1, isCraft and totalCrafts or totalSkills do
        local skillName, skillType = nil, nil;

        -- Get name/skilltype for the active prof.
        if isCraft then
            skillName, _, skillType = GetCraftInfo(i)
        else 
            skillName, skillType = GetTradeSkillInfo(i)
        end

        if skillType ~= "header" then
            local reagents = {};
            local totalReagents = isCraft and GetCraftNumReagents(i) or GetTradeSkillNumReagents(i);

            for j = 1, totalReagents do
                local reagentName, quantity = nil, nil;
                if isCraft then
                    reagentName, _, quantity = GetCraftReagentInfo(i, j);
                else
                    reagentName, _, quantity = GetTradeSkillReagentInfo(i, j);
                end
                reagents[#reagents + 1] = {
                    reagentName = reagentName,
                    quantity = quantity
                };
                exported = true;
            end
            skills[#skills + 1] = {
                skillName = skillName,
                reagents = reagents
            };
        end
    end
    if not exported then
        DEFAULT_CHAT_FRAME:AddMessage("Unable to export profession data.");
        DEFAULT_CHAT_FRAME:AddMessage("Open the trade skill window for the profession you wish to export data for.");
    else
        DEFAULT_CHAT_FRAME:AddMessage("Data exported for " .. (professionName or "profession") .. ": " .. #skills .. " total recipes.");
    end
    CloseTradeSkill();
    CloseCraft();
    return (professionName or tsName or "Error"), (tsRank > 0 and tsRank or rank), skills;
end

function Cauldron:HandleChatCommand(input)
  local professionName, rank, skills = Cauldron:GetTradeSkills();
  local bags = Cauldron:GetBags()
  local bagItems = Cauldron:GetBagItems()

  local exportString = "{\"playerName\":\"" .. UnitName("player") .. "\",\"money\":" .. GetMoney() .. ",\"locale\":\"" .. GetLocale() .. "\",\"profession\":{";

  exportString = exportString .. "\"name\":\"" .. professionName .. "\",\"rank\":" .. rank .. ",\"skills\":[";

  for i = 1, #skills do
    exportString = exportString .. "{\"name\":\"" .. skills[i].skillName .. "\"";

    --[[ Nuke reagants for now
        if skills[i].reagents ~= nil then
        local regs = skills[i].reagents;
        exportString = exportString .. ",\"reagents\":[";
        for r = 1, #regs do
            exportString = exportString .. "{\"name\":\"" .. regs[r].reagentName .. "\",\"quantity\":" .. regs[r].quantity .. "}";
            if r < #regs then
                exportString = exportString .. ",";
            end
        end
        exportString = exportString .. "]";
    end]]--

    exportString = exportString .. "}";

    if i < #skills then
        exportString = exportString .. ",";
    end
  end

  exportString = exportString .. "]}}";

  Cauldron:DisplayExportString(exportString);

end

function Cauldron:GetBags()
  local bags = {}

  for container = -1, 12 do
    bags[#bags + 1] = {
      container = container,
      bagName = GetBagName(container)
    }
  end

  return bags;
end

function Cauldron:GetBagItems()
  local bagItems = {}

  for container = -1, 12 do
    local numSlots = GetContainerNumSlots(container)

    for slot=1, numSlots do
      local texture, count, locked, quality, readable, lootable, link, isFiltered, hasNoValue, itemID = GetContainerItemInfo(container, slot)

      if itemID then
        bagItems[#bagItems + 1] = {                    
          container = container,
          slot = slot,
          itemID = itemID,
          count = count
        }
      end
    end
  end

  return bagItems
end

function Cauldron:DisplayExportString(exportString)

  local encoded = Cauldron:encode(exportString);
  
  CgbFrame:Show();
  CgbFrameScroll:Show()
  CgbFrameScrollText:Show()
  CgbFrameScrollText:SetText("!upload " .. encoded)
  CgbFrameScrollText:HighlightText()
  
  CgbFrameButton:SetScript("OnClick", function(self)
    CgbFrame:Hide();
    end
  );
end

local extract = _G.bit32 and _G.bit32.extract
if not extract then
	if _G.bit then
		local shl, shr, band = _G.bit.lshift, _G.bit.rshift, _G.bit.band
		extract = function( v, from, width )
			return band( shr( v, from ), shl( 1, width ) - 1 )
		end
	elseif _G._VERSION >= "Lua 5.3" then
		extract = load[[return function( v, from, width )
			return ( v >> from ) & ((1 << width) - 1)
		end]]()
	else
		extract = function( v, from, width )
			local w = 0
			local flag = 2^from
			for i = 0, width-1 do
				local flag2 = flag + flag
				if v % flag2 >= flag then
					w = w + 2^i
				end
				flag = flag2
			end
			return w
		end
	end
end

local char, concat = string.char, table.concat

function Cauldron:makeencoder( s62, s63, spad )
	local encoder = {}
	for b64code, char in pairs{[0]='A','B','C','D','E','F','G','H','I','J',
		'K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y',
		'Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n',
		'o','p','q','r','s','t','u','v','w','x','y','z','0','1','2',
		'3','4','5','6','7','8','9',s62 or '+',s63 or'/',spad or'='} do
		encoder[b64code] = char:byte()
	end
	return encoder
end

function Cauldron:encode( str )
	encoder = Cauldron:makeencoder()
	local t, k, n = {}, 1, #str
	local lastn = n % 3
	for i = 1, n-lastn, 3 do
		local a, b, c = str:byte( i, i+2 )
		local v = a*0x10000 + b*0x100 + c

		t[k] = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[extract(v,6,6)], encoder[extract(v,0,6)])
		k = k + 1
	end
	if lastn == 2 then
		local a, b = str:byte( n-1, n )
		local v = a*0x10000 + b*0x100
		t[k] = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[extract(v,6,6)], encoder[64])
	elseif lastn == 1 then
		local v = str:byte( n )*0x10000
		t[k] = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[64], encoder[64])
	end
	return concat( t )
end
