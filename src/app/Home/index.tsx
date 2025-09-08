import { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Filter } from "@/components/Filter";
import { Item } from "@/components/Item";

import { styles } from "./styles";
import { FilterStatus } from "@/types/FilterStatus";
import { ItemStorage, itemStorage } from "@/storage/itemStorage";

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE];

export function Home() {
  const [filter, setFilter] = useState(FilterStatus.PENDING);
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ItemStorage[]>([]);

  async function handleAdd() {
    if (!description.trim()) {
      return Alert.alert("Adicionar", "Informe a descrição para adicionar!");
    }

    const newItem = {
      id: Math.random().toString(36).substring(2),
      description,
      status: FilterStatus.PENDING,
    };

    await itemStorage.add(newItem);
    await itemsByStatus();

    setFilter(FilterStatus.PENDING);
    Alert.alert("Adicionado", `Adicionado ${description} com sucesso!`);
    setDescription("");
  }

  async function itemsByStatus() {
    try {
      const response = await itemStorage.getByStatus(filter);
      setItems(response);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível obter os itens.");
    }
  }

  async function handleRemove(id: string) {
    try {
      await itemStorage.remove(id);
      await itemsByStatus();
      Alert.alert("Removido", "Item removido com sucesso!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível remover o item.");
    }
  }

  function handleClear() {
    Alert.alert("Limpar", "Deseja remover todos os itens?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        onPress: () => onClear(),
      },
    ]);
  }

  async function onClear() {
    try {
      await itemStorage.clear();
      setItems([]);
      Alert.alert("Limpar", "Itens removidos com sucesso!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível limpar os itens.");
    }
  }

  async function handleToggleItemStatus(id: string) {
    try {
      await itemStorage.toggleStatus(id);
      await itemsByStatus();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível alterar o status do item.");
    }
  }

  useEffect(() => {
    itemsByStatus();
  }, [filter]);

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/logo.png")} style={styles.logo} />

      <View style={styles.form}>
        <Input
          placeholder="O que você precisa comprar?"
          onChangeText={setDescription}
          value={description}
        />
        <Button title="Adicionar" onPress={handleAdd} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          {FILTER_STATUS.map((status) => (
            <Filter
              key={status}
              status={status}
              isActive={status === filter}
              onPress={() => setFilter(status)}
            />
          ))}
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Item
              data={item}
              onStatusChange={() => handleToggleItemStatus(item.id)}
              onRemove={() => handleRemove(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Nenhum Item Aqui</Text>
          )}
        />
      </View>
    </View>
  );
}
