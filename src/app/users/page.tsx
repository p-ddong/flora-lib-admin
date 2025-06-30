"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { User2 } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash, Check, X, ShieldOff, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  deleteUser,
  fetchUserList,
  updateUser,
  toggleBanUser,        // <── mới
} from "@/services/user.service"
import { setUserList, setUserLoading } from "@/store/userSlice"
import { Badge } from "@/components/ui/badge"

const roleOptions = ["user", "admin", "super-admin"]

const UsersPage = () => {
  const dispatch = useDispatch()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const [token, setToken] = useState<string | null>(null)
  const users = useSelector((state: RootState) => state.user.list)
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const [search, setSearch] = useState("")
  const [sortAsc, setSortAsc] = useState(true)
  const [editedRoles, setEditedRoles] = useState<Record<string, string>>({})

  // ───────── filter / sort ─────────
  const filtered = useMemo(() => {
    let list = [...users]
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(
        (u) => u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s),
      )
    }
    list.sort((a, b) =>
      sortAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return list
  }, [users, search, sortAsc])

  // ───────── role edit helpers ─────────
  const handleRoleChange = (id: string, newRole: string) =>
    setEditedRoles((prev) => ({ ...prev, [id]: newRole }))

  const handleCancel = (id: string) =>
    setEditedRoles((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })

  const handleSave = async (id: string) => {
    const newRole = editedRoles[id]
    if (!newRole || !token) return
    try {
      await updateUser(id, { roleName: newRole }, token)
      dispatch(setUserLoading(true))
      dispatch(setUserList(await fetchUserList(token)))
      handleCancel(id)
      alert("Role updated successfully")
    } catch (err) {
      console.error(err)
      alert("Failed to update role")
      dispatch(setUserLoading(false))
    }
  }

  // ───────── ban helpers ─────────
  const handleToggleBan = async (u: User2) => {
    if (!token) return
    try {
      await toggleBanUser(u._id, { is_banned: !u.is_banned }, token)
      dispatch(setUserLoading(true))
      dispatch(setUserList(await fetchUserList(token)))
      alert(`${u.is_banned ? "Unbanned" : "Banned"} successfully`)
    } catch (err) {
      console.error(err)
      alert("Failed to change status")
    }
  }

  useEffect(() => {
    setToken(window.localStorage.getItem("token"))
  }, [])

  // ───────── render ─────────
  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="flex gap-4 flex-wrap items-center">
        <Input
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={() => setSortAsc((p) => !p)}>
          Sort by Date {sortAsc ? "↑" : "↓"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((u) => {
            const isEditing = editedRoles[u._id] !== undefined
            const selectedRole = editedRoles[u._id] ?? u.role
            const isSuperAdmin = currentUser?.role === "super-admin"

            return (
              <TableRow key={u._id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>

                {/* ---------- Role ---------- */}
                <TableCell>
                  {isSuperAdmin ? (
                    <Select value={selectedRole} onValueChange={(val) => handleRoleChange(u._id, val)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{u.role}</span>
                  )}
                </TableCell>

                {/* ---------- Status ---------- */}
                <TableCell>
                  {u.is_banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  )}
                </TableCell>

                <TableCell>{format(new Date(u.createdAt), "dd/MM/yyyy")}</TableCell>

                {/* ---------- Actions ---------- */}
                <TableCell className="text-right space-x-2">
                  {/* Save / cancel when editing role */}
                  {isSuperAdmin && isEditing ? (
                    <>
                      <Button variant="outline" size="icon" className="text-green-600" onClick={() => handleSave(u._id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400" onClick={() => handleCancel(u._id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* View placeholder */}
                      {/* <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button> */}

                      {/* Ban / Unban */}
                      {isSuperAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={u.is_banned ? "text-green-600" : "text-red-600"}
                            >
                              {u.is_banned ? (
                                <ShieldCheck className="h-4 w-4" />
                              ) : (
                                <ShieldOff className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {u.is_banned ? "Unban this user?" : "Ban this user?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {u.is_banned
                                  ? "The user will regain access immediately."
                                  : "The user will be prevented from signing in until unbanned."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleToggleBan(u)}>
                                {u.is_banned ? "Unban" : "Ban"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {/* Delete */}
                      {isSuperAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => setSelectedUserId(u._id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The user will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  if (!selectedUserId || !token) return
                                  try {
                                    await deleteUser(selectedUserId, token)
                                    dispatch(setUserLoading(true))
                                    dispatch(setUserList(await fetchUserList(token)))
                                    setSelectedUserId(null)
                                    alert("User deleted successfully")
                                  } catch (err) {
                                    console.error(err)
                                    alert("Failed to delete user")
                                  }
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default UsersPage
